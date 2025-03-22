import { baseUrl } from "../../common/constraints";
import { fetcher } from "@/lib/fetch";
import { AdminGuard } from "@/components/guards/admin-guard";
import PlayerCrud from "../../../components/admin/player-crud";

export default async function Page() {
  return (
    <AdminGuard>
      <div className="flex flex-col gap-4">
        <PlayerCrud
          playerList={await fetcher(`${baseUrl}/api/player/players-read`)}
        />
      </div>
    </AdminGuard>
  );
}
