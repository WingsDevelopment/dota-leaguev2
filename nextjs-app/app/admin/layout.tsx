import React from "react";
import { AdminGuard } from "@/components/guards/admin-guard";
import { MyLink } from "@/components/ui/my-link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex flex-col">
        <div className="flex flex-row gap-4 p-4">
          <MyLink href="/admin">Vouches</MyLink>
          <MyLink href="/admin/players">Players</MyLink>
          <MyLink href="/admin/games">Games</MyLink>
        </div>
        {children}
      </div>
    </AdminGuard>
  );
}
