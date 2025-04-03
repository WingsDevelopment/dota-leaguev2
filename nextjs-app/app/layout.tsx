import { SessionProvider } from "next-auth/react";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { MainNav } from "../components/dashboard/main-nav";
import SocialLinks from "../components/ui/social-links";
import ErrorBoundary from "../components/error-boundary/error-boundary";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

/**
 * RootLayout component wraps the application in global providers.
 * It includes a SessionProvider, ThemeProvider, and a custom ErrorBoundary to catch any rendering errors.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children elements to render within the layout.
 * @returns {JSX.Element} The root layout for the application.
 */
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
            {/* Wrap the main content with an error boundary to catch rendering errors */}
            <ErrorBoundary>
              <div className="p-2 md:p-20">{children}</div>
            </ErrorBoundary>
            <SocialLinks /> {/* Fixed social icons */}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
