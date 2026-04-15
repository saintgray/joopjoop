import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { sendEmailVerification, sendSMS } from "@thinkingcat/ums";

const SERVICE_NAME = "줍행";

const BodySchema = z.object({
  action: z
    .enum(["send_verification_email", "verify_email", "send_verification_phone", "verify_phone", "finalize"])
    .optional(),
  email: z.string().email().max(320).optional(),
  displayName: z.string().min(2).max(80).optional(),
  password: z.string().min(8).max(72).optional(),
  phone: z.string().min(8).max(30).optional(),
  code: z.string().min(4).max(8).optional(),
});

function code6() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanPhone(p: string) {
  return p.replace(/[^0-9]/g, "");
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });

  const action = parsed.data.action ?? "finalize";
  const email = (parsed.data.email ?? "").trim().toLowerCase();

  // 이메일 인증 번호 발송
  if (action === "send_verification_email") {
    if (!email) return NextResponse.json({ ok: false, error: "EMAIL_REQUIRED" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ ok: false, error: "EMAIL_EXISTS" }, { status: 409 });

    const rl = rateLimit(`ums:email:${email}`, 5, 10 * 60_000);
    if (!rl.ok) return NextResponse.json({ ok: false, error: "RATE_LIMITED", resetAt: rl.resetAt }, { status: 429 });

    const code = code6();
    const expiresAt = new Date(Date.now() + 10 * 60_000);

    await prisma.pendingRegistration.upsert({
      where: { email },
      update: { emailCode: code, emailExpiresAt: expiresAt, emailVerifiedAt: null },
      create: { email, emailCode: code, emailExpiresAt: expiresAt },
    });

    try {
      await sendEmailVerification(email, code, "고객", { serviceName: SERVICE_NAME });
    } catch {
      // 개발 환경에서는 발송 실패 시에도 코드로 진행 가능하게 함
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ ok: false, error: "EMAIL_SEND_FAILED" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, message: "인증 코드가 전송되었습니다.", code: process.env.NODE_ENV === "development" ? code : undefined });
  }

  // 이메일 인증 코드 확인
  if (action === "verify_email") {
    const code = (parsed.data.code ?? "").trim();
    if (!email || !code) return NextResponse.json({ ok: false, error: "INFO_REQUIRED" }, { status: 400 });

    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
    if (!pending || pending.emailCode !== code) return NextResponse.json({ ok: false, error: "INVALID_CODE" }, { status: 400 });
    if (pending.emailExpiresAt && pending.emailExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ ok: false, error: "CODE_EXPIRED" }, { status: 400 });
    }

    await prisma.pendingRegistration.update({
      where: { email },
      data: { emailVerifiedAt: new Date(), emailCode: null, emailExpiresAt: null },
    });
    return NextResponse.json({ ok: true, message: "이메일 인증이 완료되었습니다." });
  }

  // 전화번호 인증 번호 발송
  if (action === "send_verification_phone") {
    const phoneRaw = parsed.data.phone ?? "";
    if (!email || !phoneRaw) return NextResponse.json({ ok: false, error: "INFO_REQUIRED" }, { status: 400 });

    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
    if (!pending || !pending.emailVerifiedAt) return NextResponse.json({ ok: false, error: "EMAIL_VERIFY_FIRST" }, { status: 400 });

    const phone = cleanPhone(phoneRaw);
    const rl = rateLimit(`ums:sms:${phone}`, 5, 10 * 60_000);
    if (!rl.ok) return NextResponse.json({ ok: false, error: "RATE_LIMITED", resetAt: rl.resetAt }, { status: 429 });

    const code = code6();
    const expiresAt = new Date(Date.now() + 10 * 60_000);

    await prisma.pendingRegistration.update({
      where: { email },
      data: { phone, phoneCode: code, phoneExpiresAt: expiresAt, phoneVerifiedAt: null },
    });

    try {
      const message = `[${SERVICE_NAME}] 인증번호는 [${code}] 입니다. 10분 내에 입력해주세요.`;
      await sendSMS(phone, message);
    } catch {
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ ok: false, error: "SMS_SEND_FAILED" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, message: "인증 코드가 SMS로 전송되었습니다.", code: process.env.NODE_ENV === "development" ? code : undefined });
  }

  // 전화번호 인증 코드 확인
  if (action === "verify_phone") {
    const code = (parsed.data.code ?? "").trim();
    if (!email || !code) return NextResponse.json({ ok: false, error: "INFO_REQUIRED" }, { status: 400 });

    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
    if (!pending || pending.phoneCode !== code) return NextResponse.json({ ok: false, error: "INVALID_CODE" }, { status: 400 });
    if (pending.phoneExpiresAt && pending.phoneExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ ok: false, error: "CODE_EXPIRED" }, { status: 400 });
    }

    await prisma.pendingRegistration.update({
      where: { email },
      data: { phoneVerifiedAt: new Date(), phoneCode: null, phoneExpiresAt: null },
    });
    return NextResponse.json({ ok: true, message: "전화번호 인증이 완료되었습니다." });
  }

  // 최종 회원가입 완료
  if (!email) return NextResponse.json({ ok: false, error: "EMAIL_REQUIRED" }, { status: 400 });
  const displayName = (parsed.data.displayName ?? "").trim();
  const password = parsed.data.password ?? "";
  const phoneRaw = parsed.data.phone ?? "";
  if (!displayName || !password) return NextResponse.json({ ok: false, error: "INFO_REQUIRED" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return NextResponse.json({ ok: false, error: "EMAIL_EXISTS" }, { status: 409 });

  const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
  if (!pending || !pending.emailVerifiedAt) {
    return NextResponse.json({ ok: false, error: "EMAIL_VERIFICATION_REQUIRED" }, { status: 400 });
  }

  const phone = phoneRaw ? cleanPhone(phoneRaw) : null;
  if (phone && !pending.phoneVerifiedAt) {
    return NextResponse.json({ ok: false, error: "PHONE_VERIFICATION_REQUIRED" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, displayName, passwordHash },
    select: { id: true, email: true, displayName: true, role: true },
  });
  await prisma.pendingRegistration.delete({ where: { email } }).catch(() => null);

  return NextResponse.json({ ok: true, user });
}

