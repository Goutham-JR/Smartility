import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthHydrator } from "@/components/auth-hydrator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smartility - AI-Powered Facility Management",
  description: "Modern, intelligent facility management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthHydrator />
        {children}
      </body>
    </html>
  );
}
