import ReportsTableContainer from "@/app/admin/reports/components/reports-table-container";
import { apiCallerGetReports } from "../../api/report-system/get-reports/caller";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <ReportsTableContainer reportList={await apiCallerGetReports()} />
    </div>
  );
}
