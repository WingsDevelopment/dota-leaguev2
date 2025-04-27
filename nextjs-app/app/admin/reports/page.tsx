import ReportsTableContainer from "@/app/admin/reports/components/reports-table-container";
import { apiCallerGetReports } from "../../api/report-system/get-reports/caller";
import { getApiServerCallerConfig } from "@/lib/getApiServerCallerConfig";

/* -------------------- */
/*   Server Component   */
/* -------------------- */

export default async function Page() {
  /* ------- */
  /*   JSX   */
  /* ------- */
  const config = getApiServerCallerConfig();
  const reports = await apiCallerGetReports({
    config,
  });
  console.log({ log: "FETCHED FROM SERVER!!", reports });

  return (
    <div className="flex flex-col gap-4">
      <ReportsTableContainer reportList={reports} />
    </div>
  );
}
