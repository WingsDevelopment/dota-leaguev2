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
  const [registerItems, setRegisterItems] = useState(registerList)
  const [filterStatus, setFilterStatus] = useState<RegisterStatus | "ALL">(
    "ALL"
  );
  const [loading, setLoading] = useState(false)

  const handleRequest = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true)
    const requestType = event.currentTarget.name;
    const confirmed = confirm(`Are you sure you want to ${requestType} this player?`);
    if (!confirmed) return;

    const registrationId = event.currentTarget.value;
    console.log(requestType, "REQUEST TYPE")
    try {
      const response = await fetch(
        "/api/register-players/register-players-approve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ registrationId, requestType }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setLoading(false)
        throw new Error(data.error || "Failed to approve");
      }

      alert(`Player ${requestType}ed successfully`);
      setLoading(false)
      setRegisterItems((prevRegisterItems) =>
        prevRegisterItems.map((item) =>
          item.id === Number(registrationId)
            ? { ...item, status: requestType.toUpperCase()+'D' as RegisterStatus }
            : item
        )
      );
    } catch (error) {
      setLoading(false)
      console.error("Error approving player:", error);
      alert("Error approving player");
    }
  };


  // Filter the registerList based on the selected status
  const filteredRegisterList =
    filterStatus === "ALL"
      ? registerItems
      : registerItems.filter((register) => register.status === filterStatus);

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
                {filteredRegisterList.map((registerItems: register) => {
                  return (
                    <TableRow key={registerItems.id}>
                      <TableCell>{registerItems.id}</TableCell>
                      <TableCell>{registerItems.status}</TableCell>
                      <TableCell>{registerItems.steam_id}</TableCell>
                      <TableCell>{registerItems.name}</TableCell>
                      <TableCell>{registerItems.discord_id}</TableCell>
                      <TableCell>{registerItems.mmr}</TableCell>
                      <TableCell>
                        {registerItems.status === "PENDING" && (
                          <button
                            disabled={loading}
                            value={registerItems.id}
                            name="approve"
                            onClick={handleRequest}
                            className="bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Approve
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        {registerItems.status === "PENDING" && (
                          <button
                            disabled={loading}
                            value={registerItems.id}
                            name="decline"
                            onClick={handleRequest}
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
