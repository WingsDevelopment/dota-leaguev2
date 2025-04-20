import ReportsTableContainer from "@/app/admin/reports/components/reports-table-container";
import { apiCallerGetReports } from "../../api/report-system/get-reports/caller";

/* -------------------- */
/*   Server Component   */
/* -------------------- */

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Page() {
  /* ------- */
  /*   JSX   */
  /* ------- */

  return (
    <div className="flex flex-col gap-4">
      <ReportsTableContainer reportList={await apiCallerGetReports()} />
    </div>
  );
}
