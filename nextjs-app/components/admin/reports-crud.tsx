"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { apiCallerReviewReport } from "../../app/api/report-system/review-report/caller";
import type { UserReport } from "../../app/services/userReport/getUserReports";

/* --------- */
/*   Types   */
/* --------- */
type ReportStatus = "ALL" | "REVIEWED" | "UNREVIEWED";

/* -------------------- */
/*   Client Component   */
/* -------------------- */
export default function ReportsCrud({
  reportList,
}: {
  reportList: UserReport[];
}) {
  /* ------------- */
  /*   Metadata    */
  /* ------------- */
  const router = useRouter();

  /* --------------- */
  /*   Local State   */
  /* --------------- */
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "ALL">(
    "UNREVIEWED"
  );

  /* ---------------- */
  /*   Custom Logic   */
  /* ---------------- */
  const filteredReportList =
    filterStatus === "ALL"
      ? reportList
      : reportList.filter((report) =>
          filterStatus === "REVIEWED"
            ? report.reviewed === 1
            : report.reviewed === 0
        );

  /* ------------- */
  /*   Handlers    */
  /* ------------- */
  const handleSolve = async (reportId: number) => {
    if (!confirm("Are you sure ?")) return;

    apiCallerReviewReport(reportId).then(() => {
      router.refresh();
    });
  };

  /* ------- */
  /*   JSX   */
  /* ------- */
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold mb-4">Player Reports</h1>
          </CardTitle>
          <CardDescription>
            After reviewing the game and taking appropriate action, you can
            resolve the report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="mb-4">
            <label htmlFor="status-filter" className="mr-2">
              Filter by Status:
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as ReportStatus | "ALL")
              }
              className="p-2 border rounded"
            >
              <option value="ALL">All</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="UNREVIEWED">Unreviewed</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Id</TableHeaderCell>
                  <TableHeaderCell>Reporter</TableHeaderCell>
                  <TableHeaderCell>Reported</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Match Id</TableHeaderCell>
                  <TableHeaderCell>Report Text</TableHeaderCell>
                  <TableHeaderCell>Reviewed</TableHeaderCell>
                  <TableHeaderCell>Report Created At</TableHeaderCell>
                  <TableHeaderCell>Solve Report</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredReportList.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.id}</TableCell>
                    <TableCell>{report.reporter_name}</TableCell>
                    <TableCell>{report.reported_name}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>
                      {report.match_id !== null
                        ? report.match_id
                        : "Match ID is not provided."}
                    </TableCell>
                    <TableCell>{report.report}</TableCell>
                    <TableCell>
                      {report.reviewed === 1 ? "Reviewed" : "Unreviewed"}
                    </TableCell>
                    <TableCell>{report.time}</TableCell>
                    <TableCell>
                      {report.reviewed === 0 ? (
                        <Button onClick={() => handleSolve(report.id)}>
                          Solve
                        </Button>
                      ) : (
                        <></>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
