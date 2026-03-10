import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CosmicBackground } from "@/components/CosmicBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI 天纪·紫微斗数",
  description: "倪海厦天纪派别专业排盘与AI智能批命系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased text-foreground bg-background min-h-screen relative overflow-x-hidden selection:bg-primary/30`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* 全局宇宙星空背景 (Dynamic Cosmic Background) */}
          <CosmicBackground />

          <main className="relative z-10 w-full min-h-screen flex flex-col items-center">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
