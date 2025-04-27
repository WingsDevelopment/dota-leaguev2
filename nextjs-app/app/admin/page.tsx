import PlayerCrud from "../../components/admin/player-crud";
import { getApiServerCallerConfig } from "../../lib/getApiServerCallerConfig";
import { apiCallerGetReports } from "../api/report-system/get-reports/caller";
import ReportsTableContainer from "./reports/components/reports-table-container";

export default async function Page() {
  const config = getApiServerCallerConfig();
  const reports = await apiCallerGetReports({
    config,
  });
  console.log({ log: "FETCHED FROM SERVER!!", reports });

  return (
    <div className="flex flex-col gap-4">
      {/* <RegisterCrud registerList={players} /> */}
      <ReportsTableContainer reportList={reports} />
    </div>
  );
}