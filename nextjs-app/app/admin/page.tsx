
import GamesCrud from "@/components/admin/games-crud";

export default async function Page() {
    // Provide a fallback base URL if NEXT_PUBLIC_API_URL is not defined.
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/games-crud`, { cache: "no-store" });
    const data = await res.json();
    const gamesList = await data.games || [];
    return (<GamesCrud gamesList={gamesList}/>
    )
}