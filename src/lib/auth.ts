import { getServerSession } from "next-auth";
import { timingSafeEqual } from "node:crypto";
import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/db";

export async function signUp(params: {
  email: string;
  password: string;
  displayName: string;
}) {
  // Legacy path kept temporarily for compatibility.
  // New registration is handled by /api/auth/register (UMS) + NextAuth signIn(credentials).
  void params;
  throw new Error("signUp() is deprecated; use /api/auth/register + NextAuth signIn(credentials).");
}

export async function signIn(params: { email: string; password: string }) {
  // Legacy path: callers should use NextAuth signIn(credentials) from client.
  const user = await prisma.user.findUnique({
    where: { email: params.email.trim().toLowerCase() },
    select: { id: true, email: true, displayName: true, role: true, isBanned: true },
  });
  if (!user || user.isBanned) return null;
  return { id: user.id, email: user.email, displayName: user.displayName, role: user.role };
}

export async function signOut() {
  // NextAuth handles signOut on client; keep a no-op server helper for old call sites.
  return;
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true, role: true, isBanned: true },
  });
  if (!user || user.isBanned) return null;
  return user;
}

export function constantTimeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

