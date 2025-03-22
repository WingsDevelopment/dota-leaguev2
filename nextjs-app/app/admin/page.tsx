import { headers } from "next/headers";
import GamesCrud from "@/components/admin/games-crud";
import { baseUrl, isUserAdmin } from "../common/constraints";
import RegisterCrud from "@/components/admin/register-crud";
import PlayerCrud from "@/components/admin/player-crud";
import { fetcher } from "../../lib/fetcher";

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

  const [gamesData, registerPlayersRes, playerRes] = await Promise.all([
    fetcher(`${baseUrl}/api/games-crud/games-crud-read`),
    fetch(`${baseUrl}/api/register-players/register-players-read`, {
      cache: "no-store",
      headers: { cookie },
    }),
    fetch(`${baseUrl}/api/player/players-read`, {
      cache: "no-store",
      headers: { cookie },
    }),
  ]);

  const registerPlayersData = await registerPlayersRes.json();
  const playerData = await playerRes.json();

  // console.log("ADMIN PAGE FETCH");
  // console.log({
  //   gamesData,
  //   registerPlayersData,
  //   playerData
  // });

  const gamesList = gamesData.games || [];
  const registerList = registerPlayersData.registerPlayers || [];
  const playerList = playerData.players || [];

  return (
    <div className="flex flex-col gap-4">
      <RegisterCrud registerList={registerList} />
      <GamesCrud gamesList={gamesList} />
      <PlayerCrud playerList={playerList} />
    </div>
  );
}
