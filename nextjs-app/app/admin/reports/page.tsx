"use client";

import { useState, useEffect } from "react";
import ReportsTableContainer from "@/app/admin/reports/components/reports-table-container";
import { apiCallerGetReports } from "@/app/api/report-system/get-reports/caller";

export default function ReportsPage() {
  const [reportList, setReportList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiCallerGetReports()
      .then((data) => setReportList(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load reports");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading reports…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="flex flex-col gap-4">
      <ReportsTableContainer reportList={reportList} />
    </div>
  );
}
