import GamesCrud from "@/components/admin/games-crud";
import { baseUrl } from "../../common/constraints";
import { fetcher } from "@/lib/fetch";
import { getApiServerCallerConfig } from "@/lib/getApiServerCallerConfig";
import { apiCallerGamesRead } from "@/app/api/games-crud/games-crud-read/caller";

export default async function Page() {
  const config= getApiServerCallerConfig()
  const gamesList= await apiCallerGamesRead({config})
  return (
    <div className="flex flex-col gap-4">
      <GamesCrud
        gamesList={
          gamesList
        }
      />
    </div>
  );
}
