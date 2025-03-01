"use client";

import { SessionProvider } from "next-auth/react";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { MainNav } from "../components/dashboard/main-nav";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="border-b">
              <MainNav className="mx-6" />
            </div>
            <div className="p-2 md:p-20">{children}</div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
