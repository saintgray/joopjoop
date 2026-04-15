import type { Metadata } from "next";
import { Public_Sans, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { AuthProvider } from "@/components/providers/AuthProvider";

const headline = Public_Sans({
  variable: "--font-headline",
  subsets: ["latin"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "줍줍",
  description: "우리 동네 분실물을 찾아보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${headline.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--civic-bg)] text-[var(--civic-text)]">
        <AuthProvider>
          <TopNav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
