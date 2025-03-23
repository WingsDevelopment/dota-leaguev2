import { baseUrl } from "../../common/constraints";
import { fetcher } from "@/lib/fetch";
import PlayerCrud from "@/components/admin/player-crud";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PlayerCrud
        playerList={
          (await fetcher(`${baseUrl}/api/player/players-read`))?.players || []
        }
      />
    </div>
  );
}
