import Link from "next/link";
import React from "react";
import { AdminGuard } from "../../components/guards/admin-guard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex flex-col">
        <div className="flex flex-row">
          <Link href="/admin">Vouches</Link>
          <Link href="/admin/players">Players</Link>
          <Link href="/admin/games">Games</Link>
        </div>
        {children}
      </div>
    </AdminGuard>
  );
}
