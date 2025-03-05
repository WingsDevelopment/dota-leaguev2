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
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

type RegisterStatus = "PENDING" | "APPROVED" | "DECLINED";

interface register {
  id: number;
  status: RegisterStatus;
  steam_id: number;
  name: string;
  discord_id: number;
  mmr: number;
}

export default function RegisterCrud({
  registerList,
}: {
  registerList: register[];
}) {
  const [filterStatus, setFilterStatus] = useState<RegisterStatus | "ALL">(
    "PENDING"
  );

  const handleApprove = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const confirmed = confirm("Are you sure you want to approve this player?");
    if (!confirmed) return;

    const registrationId = event.currentTarget.value;
    try {
      const response = await fetch(
        "/api/register-players/register-players-approve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ registrationId }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to approve");
      }

      alert("Player approved successfully");
      window.location.reload(); // TODO improve this, refetch (change state) instead of reload
    } catch (error) {
      console.error("Error approving player:", error);
      alert("Error approving player");
    }
  };

  const handleDecline = () => {};

  // Filter the registerList based on the selected status
  const filteredRegisterList =
    filterStatus === "ALL"
      ? registerList
      : registerList.filter((register) => register.status === filterStatus);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold mb-4">Request Vouch</h1>
          </CardTitle>
          <CardDescription>Registered Players</CardDescription>
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
                setFilterStatus(e.target.value as RegisterStatus | "ALL")
              }
              className="p-2 border rounded"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="DECLINED">Declined</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Id</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Steam_id</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Discord_id</TableHeaderCell>
                  <TableHeaderCell>MMR</TableHeaderCell>
                  <TableHeaderCell>Approve Player</TableHeaderCell>
                  <TableHeaderCell>Decline Player</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredRegisterList.map((register: register) => {
                  return (
                    <TableRow key={register.id}>
                      <TableCell>{register.id}</TableCell>
                      <TableCell>{register.status}</TableCell>
                      <TableCell>
                        <Link
                          href={`https://steamcommunity.com/profiles/${register.steam_id}`}
                          className="text-blue-500 hover:underline"
                          target="_blank"
                        >
                          {register.steam_id}
                        </Link>
                      </TableCell>
                      <TableCell>{register.name}</TableCell>
                      <TableCell>{register.discord_id}</TableCell>
                      <TableCell>{register.mmr}</TableCell>
                      <TableCell>
                        {register.status === "PENDING" && (
                          <button
                            value={register.id}
                            name="approve"
                            onClick={handleApprove}
                            className="bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Approve
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        {register.status === "PENDING" && (
                          <button
                            value={register.id}
                            name="decline"
                            onClick={handleDecline}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Decline
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
