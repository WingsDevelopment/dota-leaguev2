import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";
import { closeDatabase } from "@/db/initDatabase";

export async function POST(req: NextRequest) {
    if (!(await isUserAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, value } = await req.json();

    if (!id || !value) {
        return NextResponse.json(
            { error: "Missing player ID or ban value" },
            { status: 400 }
        );
    }

    const db = await getDbInstance();

    try {
        const player: { banned_until: string | null; games_left: number; games_griefed: number; bbb: number } | undefined =
            await new Promise((resolve, reject) => {
                db.get(
                    `SELECT banned_until, games_left, games_griefed, bbb FROM Players WHERE id = ?`,
                    [id],
                    (err, row) => {
                        if (err) {
                            console.error("Error fetching player:", err);
                            return reject(err);
                        }
                        resolve(row as any);
                    }
                );
            });

        if (!player) {

            return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }


        let { banned_until, games_left, games_griefed, bbb } = player;
        let newBanDate = banned_until ? new Date(banned_until) : null;

        if (value === "1lu") {
            games_left = Math.max(0, games_left - 1);
            if (games_left === 1) {
                if (newBanDate) {
                    newBanDate.setDate(newBanDate.getDate() - 30);
                } else {
                    newBanDate = new Date();
                    newBanDate.setDate(newBanDate.getDate() - 30);
                }
            }
        } else if (value === "1gu") {
            games_griefed = Math.max(0, games_griefed - 1);
            if (games_griefed === 2) {
                if (newBanDate) {
                    newBanDate.setDate(newBanDate.getDate() - 365);
                }
            } else if (games_griefed === 1) {
                if (newBanDate) {
                    newBanDate.setDate(newBanDate.getDate() - 5);
                }
            } else if (games_griefed === 0) {
                if (newBanDate) {
                    newBanDate.setDate(newBanDate.getDate() - 4);
                }
            }
        } else if (value === "bbbu") {
            bbb = 0;
            if (newBanDate) {
                newBanDate.setDate(newBanDate.getDate() - 1278);
            }
        } else {
            return NextResponse.json({ error: "Invalid ban type" }, { status: 400 });
        }

        if (newBanDate && newBanDate < new Date()) {
            newBanDate = null;
        }

        const bannedUntilStr = newBanDate ? newBanDate.toISOString().split("T")[0] : null;

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE Players SET banned_until = ?, games_left = ?, games_griefed = ?, bbb = ? WHERE id = ?`,
                [bannedUntilStr, games_left, games_griefed, bbb, id],
                (err) => {
                    if (err) {
                        console.error("Error updating player:", err);
                        return reject(err);
                    }
                    resolve(null);
                }
            );
        });

        return NextResponse.json({
            success: true,
            message: `Player ${id} updated successfully`,
        });
    } catch (error) {
        console.error("Error updating player ban:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    } finally {
        closeDatabase(db);
    }
}