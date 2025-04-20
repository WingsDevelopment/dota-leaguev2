import PlayerCrud from "@/components/admin/player-crud";
import { apiCallerGetPlayers } from "@/app/api/player/players-read/caller";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PlayerCrud playerList={await apiCallerGetPlayers()} />
    </div>
  );
}
