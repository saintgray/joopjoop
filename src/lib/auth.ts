import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "jubhaeng_session";

function newToken(): string {
  return randomBytes(32).toString("hex");
}

export async function signUp(params: {
  email: string;
  password: string;
  displayName: string;
}) {
  const email = params.email.trim().toLowerCase();
  const displayName = params.displayName.trim();
  const passwordHash = await bcrypt.hash(params.password, 12);

  const user = await prisma.user.create({
    data: { email, displayName, passwordHash },
    select: { id: true, email: true, displayName: true, role: true },
  });

  await createSession(user.id);
  return user;
}

export async function signIn(params: { email: string; password: string }) {
  const email = params.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      passwordHash: true,
      isBanned: true,
    },
  });

  if (!user || user.isBanned) return null;
  const ok = await bcrypt.compare(params.password, user.passwordHash);
  if (!ok) return null;

  await createSession(user.id);
  return { id: user.id, email: user.email, displayName: user.displayName, role: user.role };
}

export async function signOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookieStore.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    select: {
      expiresAt: true,
      user: { select: { id: true, email: true, displayName: true, role: true, isBanned: true } },
    },
  });

  if (!session) return null;
  if (session.user.isBanned) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.deleteMany({ where: { token } });
    return null;
  }

  return session.user;
}

async function createSession(userId: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14 days

  await prisma.session.create({ data: { token, userId, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });
}

export function constantTimeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

