import PlayerCrud from "@/components/admin/player-crud";
import { apiCallerGetPlayers } from "@/app/api/player/players-read/caller";
import { getApiServerCallerConfig } from "@/lib/getApiServerCallerConfig";

export default async function Page() {
    const config = getApiServerCallerConfig();
    const playerList = await apiCallerGetPlayers({
      config
    });
  return (
    <div className="flex flex-col gap-4">
      <PlayerCrud playerList={playerList} />
    </div>
  );
}
