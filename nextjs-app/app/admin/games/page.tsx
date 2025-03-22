import GamesCrud from "@/components/admin/games-crud";
import { baseUrl } from "../../common/constraints";
import { fetcher } from "@/lib/fetch";
import { AdminGuard } from "@/components/guards/admin-guard";

export default async function Page() {
  return (
    <AdminGuard>
      <div className="flex flex-col gap-4">
        <GamesCrud
          gamesList={await fetcher(`${baseUrl}/api/games-crud/games-crud-read`)}
        />
      </div>
    </AdminGuard>
  );
}
