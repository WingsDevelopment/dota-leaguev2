import Link from "next/link";

import { cn } from "@/lib/utils";
//TO DO dodati conditional rendering za admina
export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <div className="flex h-[60px] items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
          prefetch={false}
        >
          <span className="">RADEKOMSA LEAGUE</span>
        </Link>
      </div>
      <Link
        href="/rules"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Rules
      </Link>
      <Link
        href="/admin"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Admin console
      </Link>
    </nav>
  );
}
