import { baseUrl } from "../../common/constraints";
import { fetcher } from "@/lib/fetch";
import ReportsCrud from "@/components/admin/reports-crud";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <ReportsCrud
        reportList={
          (await fetcher(`${baseUrl}/api/report-system/get-reports`))?.data ||
          []
        }
      />
    </div>
  );
}
