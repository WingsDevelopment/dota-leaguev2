import RegisterCrud from "@/components/admin/register-crud";
import { getApiServerCallerConfig } from "../../lib/getApiServerCallerConfig";
import { apiCallerGetPlayers } from "../api/register-players/register-players-read/caller";

export default async function Page() {
  const config = getApiServerCallerConfig();
  const players = await apiCallerGetPlayers({
    config,
  });


  return (
    <div className="flex flex-col gap-4">
      <RegisterCrud registerList={players} />
    </div>
  );
}