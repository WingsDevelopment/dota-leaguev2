import { headers } from "next/headers";
import GamesCrud from "@/components/admin/games-crud";
import { fetcher } from "../../../lib/fetcher";
import { isUserAdmin, baseUrl } from "../../common/constraints";

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

  const [gamesData] = await Promise.all([
    fetcher(`${baseUrl}/api/games-crud/games-crud-read`),
  ]);

  const gamesList = gamesData.games || [];

  return (
    <div className="flex flex-col gap-4">
      <GamesCrud gamesList={gamesList} />
    </div>
  );
}
