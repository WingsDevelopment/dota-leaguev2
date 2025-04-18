import { baseUrl } from "../../common/constraints";
import { fetcher } from "@/lib/fetch";
import { AdminGuard } from "@/components/guards/admin-guard";
import SteamBots from "./steam-bots";

export default async function Page() {
  return (
    <AdminGuard>
      <div className="flex flex-col gap-4">
        <SteamBots
          steamBots={
            // TODO: refactor rest pages. should always be 'result' returned from api, instead of player, games etc..
            (await fetcher(`${baseUrl}/api/steam-bots`))?.result || []
          }
        />
      </div>
    </AdminGuard>
  );
}
