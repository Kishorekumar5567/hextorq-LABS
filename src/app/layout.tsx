import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/common/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HEXTORQ LABS — Client Collaboration SaaS",
  description: "Unified client collaboration platform by HEXTORQ LABS: live Vercel previews, visual review studio pins, milestone sign-offs, LiveKit video meetings, and payments.",
  icons: {
    icon: "/hextorq-logo.png",
    apple: "/hextorq-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090A0F] text-zinc-100 selection:bg-white/[0.15] selection:text-white">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
