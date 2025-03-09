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
        if (value === "unban") {
            // Reset all punishment-related fields
            await new Promise((resolve, reject) => {
                db.run(
                    `UPDATE Players SET banned_until = NULL WHERE id = ?`,
                    [id],
                    (err) => (err ? reject(err) : resolve(null))
                );
            });

            return NextResponse.json({ success: true, message: "Player unbanned successfully" });
        }
        // Fetch the player's current banned_until and games_left values
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
        console.log(games_left, "GAMOVA LIVANO")
        // Handle punishment cases
        if (value === "1l") {
            games_left += 1;
            if (games_left === 1) {
                // Do nothing
            } else if (games_left === 2) {
                // Add 30 days to ban
                if (newBanDate) {
                    newBanDate.setDate(newBanDate.getDate() + 30);
                } else {
                    newBanDate = new Date();
                    newBanDate.setDate(newBanDate.getDate() + 30);
                }
            }

        } else if (value === "1g") {
            games_griefed += 1
            if (games_griefed === 1) {
                // Add 4 days to ban
                if (newBanDate) {
                    newBanDate.setDate(newBanDate.getDate() + 4);
                } else {
                    newBanDate = new Date();
                    newBanDate.setDate(newBanDate.getDate() + 4);
                }
            } else if (games_griefed === 2) {
                // Add 5 days to ban
                if (newBanDate) {
                    newBanDate.setDate(newBanDate.getDate() + 5);
                } else {
                    newBanDate = new Date();
                    newBanDate.setDate(newBanDate.getDate() + 5);
                }
            } else if (games_griefed >= 3) {
                // Add 365 days to ban
                if (newBanDate) {
                    newBanDate.setDate(newBanDate.getDate() + 365);
                } else {
                    newBanDate = new Date();
                    newBanDate.setDate(newBanDate.getDate() + 365);
                }
            }


        } else if (value === "bbb" && bbb!=1) {
            bbb = 1; // Set BBB flag
            // Add 1278.38 days to ban
            if (newBanDate) {
                newBanDate.setDate(newBanDate.getDate() + 1278);
            } else {
                newBanDate = new Date();
                newBanDate.setDate(newBanDate.getDate() + 1278);
            }
        } else {
            
            return NextResponse.json({ error: "Player already has this ban" }, { status: 400 });
        }

        // Convert newBanDate to string if it was modified
        const bannedUntilStr = newBanDate ? newBanDate.toISOString().split("T")[0] : null;

        // Update the player record
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
