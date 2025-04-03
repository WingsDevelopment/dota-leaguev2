import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { NextResponse } from "next/server";

interface ReviewReports {
    id: string
}
export async function ReviewUserReport({ id }: ReviewReports) {
    const db = await getDbInstance();
    try {

        await new Promise<void>((resolve, reject) => {
            db.run(`UPDATE UserReport SET reviewed = 1 WHERE id= ?`, [id], (err) => {
                if (err) {
                    console.error("Error updating review:", err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        return NextResponse.json({
            success: true,
            message: "Report is Solved",
        });
    } catch (error) {
        console.error("Error updating the review:", error);
        closeDatabase(db);
        return { success: false, message: "Internal Server Error" };
    }
}
