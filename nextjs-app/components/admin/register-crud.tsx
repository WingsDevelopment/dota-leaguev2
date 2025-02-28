'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { useState } from "react";

type RegisterStatus = "PENDING" | "APPROVED" | "DECLINED"

interface register {
    id: number,
    status: RegisterStatus,
    steam_id: number,
    name:string,
    discord_id:number,
    mmr: number
}

export default function RegisterCrud({ registerList }: { registerList: register[] }) {
const handleApprove=()=>{

}
const handleDecline=()=>{
    
}
    return (<div>
        <Card>
            <CardHeader>
                <CardTitle>
                    <h1 className="text-3xl font-bold mb-4">Request Vouch</h1>
                </CardTitle>
                <CardDescription>Registered Players</CardDescription>
            </CardHeader>
            <CardContent>
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
                            {registerList.map((register: register) => {
                                return (
                                    <>
                                        <TableRow key={register.id}>
                                            <TableCell >{register.id}</TableCell>
                                            <TableCell >{register.status}</TableCell>
                                            <TableCell >{register.steam_id}</TableCell>
                                            <TableCell >{register.name}</TableCell>
                                            <TableCell >{register.discord_id}</TableCell>
                                            <TableCell >{register.mmr}</TableCell>
                                            <TableCell >
                                                <button
                                                    value={register.id} name="approve"
                                                    onClick={handleApprove}>
                                                    Approve
                                                </button>
                                            </TableCell>
                                            <TableCell >
                                                <button
                                                    value={register.id}
                                                    name="decline"
                                                    onClick={handleDecline}>
                                                    Decline
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
    )
}