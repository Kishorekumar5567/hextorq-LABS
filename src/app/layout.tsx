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
  title: "Nexus — Client Collaboration SaaS for Modern Dev Agencies",
  description: "Unified workspace for high-velocity software agencies and clients: live preview visual feedback, milestone sign-offs, meetings, tickets, and payments.",
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
      <body className="min-h-full flex flex-col bg-[#080C15] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
