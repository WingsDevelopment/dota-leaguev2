
import GamesCrud from "@/components/admin/games-crud";
import { baseUrl } from "../common/constraints";
import RegisterCrud from "@/components/admin/register-crud";

export default async function Page() {
    // Provide a fallback base URL if NEXT_PUBLIC_API_URL is not defined.
    const [gamesRes, registerPlayersRes] = await Promise.all([
        fetch(`${baseUrl}/api/games-crud/games-crud-read`, { cache: "no-store" }),
        fetch(`${baseUrl}/api/register-players/register-players-read`, { cache: "no-store" }),
    ])
    const [gamesData, registerPlayersData] = await Promise.all([
        gamesRes.json(),
        registerPlayersRes.json(),
    ]);
    const gamesList = await gamesData.games || [];
    const registerList = await registerPlayersData.registerPlayers || [];
    console.log(registerList)
    return (<>
        <GamesCrud gamesList={gamesList} />
        <RegisterCrud registerList={registerList}/>
    </>
    )
}