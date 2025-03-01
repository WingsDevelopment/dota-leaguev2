import GamesCrud from "@/components/admin/games-crud";
import { baseUrl, isUserAdmin } from "../common/constraints";
import RegisterCrud from "@/components/admin/register-crud";

export default async function Page() {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return (
      <div>
        <h1>Unauthorized</h1>
      </div>
    );
  }

  // Provide a fallback base URL if NEXT_PUBLIC_API_URL is not defined.
  const [gamesRes, registerPlayersRes] = await Promise.all([
    fetch(`${baseUrl}/api/games-crud/games-crud-read`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/register-players/register-players-read`, {
      cache: "no-store",
    }),
  ]);
  const [gamesData, registerPlayersData] = await Promise.all([
    gamesRes.json(),
    registerPlayersRes.json(),
  ]);
  const gamesList = (await gamesData.games) || [];
  const registerList = (await registerPlayersData.registerPlayers) || [];
  console.log(registerList);
  return (
    <div className="flex flex-col gap-4">
      <RegisterCrud registerList={registerList} />
      <GamesCrud gamesList={gamesList} />
    </div>
  );
}
