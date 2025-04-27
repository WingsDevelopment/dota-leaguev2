import RegisterCrud, { vouch } from "@/components/admin/register-crud";
import { apiCallerGetPlayers } from "../api/register-players/register-players-read/caller";

export default async function Page() {

  const players: vouch[] = await apiCallerGetPlayers();

  return (
    <div className="flex flex-col gap-4">
      <RegisterCrud registerList={players} />
    </div>
  );
}