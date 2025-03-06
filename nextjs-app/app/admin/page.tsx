import { headers } from "next/headers";
import GamesCrud from "@/components/admin/games-crud";
import { baseUrl, isUserAdmin } from "../common/constraints";
import RegisterCrud from "@/components/admin/register-crud";

export default async function Page() {
  const cookie = headers().get("cookie") || "";
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return (
      <div>
        <h1>Unauthorized</h1>
      </div>
    );
  }

  const [gamesRes, registerPlayersRes] = await Promise.all([
    fetch(`${baseUrl}/api/games-crud/games-crud-read`, {
      cache: "no-store",
      headers: { cookie },
    }),
    fetch(`${baseUrl}/api/register-players/register-players-read`, {
      cache: "no-store",
      headers: { cookie },
    }),
  ]);

  const gamesData = await gamesRes.json();
  const registerPlayersData = await registerPlayersRes.json();

  console.log("ADMIN PAGE FETCH");
  console.log({
    gamesData,
    registerPlayersData,
  });

  const gamesList = gamesData.games || [];
  const registerList = registerPlayersData.registerPlayers || [];

  return (
    <div className="flex flex-col gap-4">
      <RegisterCrud registerList={registerList} />
      <GamesCrud gamesList={gamesList} />
    </div>
  );
}
