import RegisterCrud from "@/components/admin/register-crud";
import { apiCallerGetPlayers } from "../api/register-players/register-players-read/caller";
/* -------------------- */
/*   Server Component   */
/* -------------------- */
export default async function Page() {
  /* ------- */
  /*   JSX   */
  /* ------- */
  return (
    <div className="flex flex-col gap-4">
      <RegisterCrud registerList={await apiCallerGetPlayers()} />
    </div>
  );
}
