import Link from "next/link";
import React from "react";
import { AdminGuard } from "../../components/guards/admin-guard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex flex-col">
        <div className="flex flex-row gap-4 p-4">
          <Link className="underline" href="/admin">
            Vouches
          </Link>
          <Link className="underline" href="/admin/players">
            Players
          </Link>
          <Link className="underline" href="/admin/games">
            Games
          </Link>
          <Link className="underline" href="/admin/reports">
            User Reports
          </Link>
          <Link className="underline" href="/admin/steam-bots">
            Steam bots
          </Link>
        </div>
        {children}
      </div>
    </AdminGuard>
  );
}
