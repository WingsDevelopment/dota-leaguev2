import { baseUrl } from "../common/constraints";
import RegisterCrud from "@/components/admin/register-crud";
import { fetcher } from "@/lib/fetch";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <RegisterCrud
        registerList={
          (
            await fetcher(
              `${baseUrl}/api/register-players/register-players-read`
            )
          )?.registerPlayers || []
        }
      />
    </div>
  );
}
