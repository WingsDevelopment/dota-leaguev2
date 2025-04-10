import { baseUrl } from "../../common/constraints";
import { fetcher } from "@/lib/fetch";
import PlayerCrud from "@/components/admin/player-crud";
import { apiCallerGetPlayers } from "@/app/api/player/players-read/caller";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PlayerCrud playerList={await apiCallerGetPlayers()}
      />
    </div>
  );
}
