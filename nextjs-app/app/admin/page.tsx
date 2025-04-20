import RegisterCrud from "@/components/admin/register-crud";
import { apiCallerGetRegisterPlayers2 } from "../api/register-players/read/caller";
import { isUserAdminHack } from "../common/constraints";
/* -------------------- */
/*   Server Component   */
/* -------------------- */

export default async function Page() {
  if (!(await isUserAdminHack())) return "Unauthorized";
  /* ------- */
  /*   JSX   */
  /* ------- */
  return (
    <div className="flex flex-col gap-4">
      <RegisterCrud registerList={await apiCallerGetRegisterPlayers2()} />
    </div>
  );
}
