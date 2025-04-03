import ReportsCrud from "@/components/admin/reports-crud";
import { apiCallerGetReports } from "../../api/report-system/get-reports/caller";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <ReportsCrud reportList={await apiCallerGetReports()} />
    </div>
  );
}
