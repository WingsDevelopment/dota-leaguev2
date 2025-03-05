import { NextRequest, NextResponse } from "next/server";
import { getDbInstance } from "@/db/utils";
import { isUserAdmin } from "@/app/common/constraints";

export async function PUT(req: NextRequest) {
    if (!(await isUserAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id === undefined || !status) {
        return NextResponse.json(
            { error: "Missing game id or status" },
            { status: 400 }
        );
    }

    const db = await getDbInstance();
    try {
        const actualGame: { status: string } | undefined = await new Promise(
            (resolve, reject) => {
                db.get(`SELECT status FROM Game WHERE id = ?`, [id], (err, row) => {
                    if (err) {
                        console.error("Error fetching game status:", err);
                        return reject(err);
                    }
                    resolve(row as any);
                });
            }
        );
        if (!actualGame) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }
        if (actualGame.status != status) {
            return NextResponse.json(
                { error: "Game status mismatch. Possible tampering detected." }, 
                { status: 403 })
        }
        await new Promise <void>((resolve,reject)=>{
            db.run(`UPDATE Game SET status ='CANCEL' WHERE id= ?`,[id],(err)=>{
                if(err){
                    console.error("Error updating game status:",err);
                    reject(err);
                }else{
                    resolve();
                }
            });
        });
        return NextResponse.json({
            success: true,
            message: "Game is Canceled",
          });
    } catch (error) {
        console.error("Error Canceling the game", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
    }finally{
        db.close();
    }

}
