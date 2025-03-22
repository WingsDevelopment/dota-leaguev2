import { AdminGuard } from "@/components/guards/admin-guard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
