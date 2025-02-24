import { auth } from "@/auth";
import GamesCrud from "@/components/admin/games-crud";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";

export default async function Page() {
    const session = await auth();
    // Provide a fallback base URL if NEXT_PUBLIC_API_URL is not defined.
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/games-crud`, { cache: "no-store" });
    const data = await res.json();
    const games = await data.games || [];
    return (<GamesCrud games={games}/>
    )
}