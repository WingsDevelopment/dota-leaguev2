"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignIn } from "./signIn";
import { ModeToggle } from "@/components/ui/ModeToggle";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-2",
        className
      )}
      {...props}
    >
      <div className="flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
          prefetch={false}
        >
          <span>RADEKOMSA LEAGUE</span>
        </Link>
      </div>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-4">
      <Link
          href="/admin"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Admin Console
        </Link>
        <Link
          href="/info"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Info
        </Link>
        <Link
          href="/rules"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Rules
        </Link>
        <ModeToggle />
        <SignIn />
      </div>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem asChild>
              <Link href="/">Home</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/info">Info</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/rules">Rules</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ModeToggle />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <SignIn />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
