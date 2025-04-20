import RegisterCrud from "@/components/admin/register-crud";
import { apiCallerGetRegisterPlayers2 } from "../api/register-players/read/caller";
/* -------------------- */
/*   Server Component   */
/* -------------------- */
export default async function Page() {
  /* ------- */
  /*   JSX   */
  /* ------- */
  return (
    <div className="flex flex-col gap-4">
      <RegisterCrud registerList={await apiCallerGetRegisterPlayers2()} />
    </div>
  );
}
