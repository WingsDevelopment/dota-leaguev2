"use client";
import { apiCallerApprovePlayers } from "@/app/api/register-players/register-players-approve/caller";
import { PrimitiveServiceResponse } from "@/app/services/common/types";
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
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

type VouchStatus = "PENDING" | "APPROVED" | "DECLINED";

interface vouch {
  id: number;
  status: VouchStatus;
  steam_id: number;
  name: string;
  discord_id: number;
  mmr: number;
}

export default function RegisterCrud({
  registerList,
}: {
  registerList: vouch[];
}) {
  const [vouchItems, setVouchItems] = useState(registerList);
  const [filterStatus, setFilterStatus] = useState<VouchStatus | "ALL">(
    "PENDING"
  );
  const [loading, setLoading] = useState(false);

  const fetchVouch = async () => {
    try {
      const res = await fetch("/api/register-players/register-players-read");
      if (!res.ok) throw new Error("Failed to fetch vouch list");
      const updatedVouchList = await res.json();

      setVouchItems(updatedVouchList.registerPlayers);
    } catch (error) { }
  };
  const handleRequest = async (registrationId: number, requestType: string) => {
    setLoading(true);
    const confirmed = confirm(
      `Are you sure you want to ${requestType} this player?`
    );
    if (!confirmed) {
      setLoading(false);
      return;
    }
    try {
      apiCallerApprovePlayers({ registrationId, requestType })
      alert(`Player ${requestType}ed successfully`);
      fetchVouch();

    } catch (error) {
      console.error("Error approving player:", error);
      alert("Error approving player");
    } finally {
      setLoading(false);
    }
  };

  // Filter the registerList based on the selected status
  const filteredVouchList =
    filterStatus === "ALL"
      ? vouchItems
      : vouchItems.filter((vouch) => vouch.status === filterStatus);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl font-bold mb-4">Request Vouch</h1>
          </CardTitle>
          <CardDescription>
            Before clicking approving anyone, make sure to click the steam_id
            link and make sure the player gave correct profile by checking their
            profile in steam.
            <br />
            If you see on steam error profile not found or similar, please
            decline that request.
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
                setFilterStatus(e.target.value as VouchStatus | "ALL")
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
                {filteredVouchList.map((vouchItem: vouch) => {
                  return (
                    <TableRow key={vouchItem.id}>
                      <TableCell>{vouchItem.id}</TableCell>
                      <TableCell>{vouchItem.status}</TableCell>
                      <TableCell>
                        <Link
                          href={`https://steamcommunity.com/profiles/${vouchItem.steam_id}`}
                          className="text-blue-500 hover:underline"
                          target="_blank"
                        >
                          {vouchItem.steam_id}
                        </Link>
                      </TableCell>
                      <TableCell>{vouchItem.name}</TableCell>
                      <TableCell>{vouchItem.discord_id}</TableCell>
                      <TableCell>{vouchItem.mmr}</TableCell>
                      <TableCell>
                        {vouchItem.status === "PENDING" && (
                          <button
                            disabled={loading}
                            onClick={() =>
                              handleRequest(vouchItem.id, "approve")
                            }
                            className="bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Approve
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        {vouchItem.status === "PENDING" && (
                          <button
                            disabled={loading}
                            onClick={() =>
                              handleRequest(vouchItem.id, "decline")
                            }
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
