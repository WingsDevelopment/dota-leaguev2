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

type ReportType = "GRIEF" | "BAD BEHAVIOUR";
type ReportStatus = "ALL" | "REVIEWED" | "UNREVIEWED"

interface Report {
  id: number,
  steam_id: number,
  other_player_steam_id: number,
  type: string,
  match_id: number,
  report: number,
  reviewed: number,
  time: string
}

export default function ReportsCrud({ reportList }: { reportList: Report[] }) {
  const [reports, setReports] = useState(reportList);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "ALL">(
    "UNREVIEWED"
  );
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/report-system/get-reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      const updatedReports = await res.json();
      setReports(updatedReports.data);
    } catch (error) {
      console.error("Error fetching reports", error);
    }
  };

  // Pass gameId directly instead of using an index.


  const handleSolve = async (reportId: number) => {
    const confirmation = confirm("Are you sure ?");
    if (!confirmation) return;
    if (!reportId) {
      return alert("Invalid Report ID")
    }
    setLoading(true);
    try {
      const res = await fetch("/api/report-system/review-report", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reportId }),
      });
      if (!res.ok) {
        throw new Error("Failed to solve the report!");
      }
      fetchReports();
    } catch (error) {
      console.error("Failed to solve the report!", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReportList =
    filterStatus === "ALL"
      ? reports
      : reports.filter((report) =>
        filterStatus === "REVIEWED"
          ? report.reviewed === 1
          : report.reviewed === 0
      );

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold mb-4">Player Reports</h1>
          </CardTitle>
          <CardDescription>
            After reviewing the game and taking appropriate action, you can resolve the report.
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
                  <TableHeaderCell>Reporter (steam_id)</TableHeaderCell>
                  <TableHeaderCell>Reported (steam_id)</TableHeaderCell>
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
                    <TableCell>{report.steam_id}</TableCell>
                    <TableCell>
                      {report.other_player_steam_id}
                    </TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.match_id}</TableCell>
                    <TableCell>{report.report}</TableCell>
                    <TableCell>{report.reviewed === 1 ? "Reviewed" : "Unreviewed"}</TableCell>
                    <TableCell>
                      {report.time}
                    </TableCell>
                    <TableCell>
                      <Button
                        disabled={loading}
                        onClick={() => handleSolve(report.id)}
                      >
                        Solve
                      </Button>
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
