
import GamesCrud from "@/components/admin/games-crud";
import { baseUrl } from "../constraints";

export default async function Page() {
    // Provide a fallback base URL if NEXT_PUBLIC_API_URL is not defined.
    const res = await fetch(`${baseUrl}/api/games-crud`, { cache: "no-store" });
    const data = await res.json();
    const gamesList = await data.games || [];
    return (<GamesCrud gamesList={gamesList}/>
    )
}