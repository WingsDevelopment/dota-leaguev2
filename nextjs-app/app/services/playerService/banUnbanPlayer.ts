import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";

interface BanUnbanParams {
  steam_id: number;
  action: "ban" | "unban";
  banType?: "1l" | "1g" | "bbb" | "1d"; // Only required for bans
}

export async function banUnbanPlayer({
  steam_id,
  action,
  banType,
}: BanUnbanParams) {
  const db = await getDbInstance();
  console.log({ steam_id });

  try {
    if (action === "unban") {
      await new Promise<void>((resolve, reject) => {
        db.run(
          `UPDATE Players SET banned_until = NULL WHERE steam_id = ?`,
          [steam_id],
          (err) => (err ? reject(err) : resolve())
        );
      });
      closeDatabase(db);
      return { success: true, message: "Player unbanned successfully" };
    }

    // Fetch the player's ban info
    const player:
      | {
          banned_until: string | null;
          games_left: number;
          games_griefed: number;
          bbb: number;
          games_didnt_show: number;
        }
      | undefined = await new Promise((resolve, reject) => {
      db.get(
        `SELECT banned_until, games_left, games_griefed, bbb, games_didnt_show FROM Players WHERE steam_id = ?`,
        [String(steam_id)],
        (err, row) => (err ? reject(err) : resolve(row as any))
      );
    });

    if (!player) {
      closeDatabase(db);
      return { success: false, message: "Player not found" };
    }

    let { banned_until, games_left, games_griefed, bbb, games_didnt_show } =
      player;
    let newBanDate = banned_until ? new Date(banned_until) : null;

    if (banType === "1l") {
      games_left += 1;
      if (games_left === 1) {
        if (newBanDate) {
          newBanDate.setDate(newBanDate.getDate() + 1);
        } else {
          newBanDate = new Date();
          newBanDate.setDate(newBanDate.getDate() + 1);
        }
      } else if (games_left >= 2) {
        // Add 30 days to ban
        if (newBanDate) {
          newBanDate.setDate(newBanDate.getDate() + 10);
        } else {
          newBanDate = new Date();
          newBanDate.setDate(newBanDate.getDate() + 10);
        }
      }
    } else if (banType === "1g") {
      games_griefed += 1;
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
    } else if (banType === "bbb") {
      bbb += 1; // Set BBB flag
      console.log(bbb, "bad behaviour ban");
      // Add 1278.38 days to ban
      if (bbb === 1) {
        if (newBanDate) {
          newBanDate.setDate(newBanDate.getDate() + 14);
        } else {
          newBanDate = new Date();
          newBanDate.setDate(newBanDate.getDate() + 14);
        }
      } else if (bbb >= 2) {
        if (newBanDate) {
          newBanDate.setDate(newBanDate.getDate() + 548);
        } else {
          newBanDate = new Date();
          newBanDate.setDate(newBanDate.getDate() + 548);
        }
      }
    } else if (banType === "1d") {
      games_didnt_show += 1;

      const additionalDays = (games_didnt_show * (games_didnt_show + 1)) / 2;

      // Use the later of today or the current banned_until date as the starting point.
      let baseDate = new Date();
      if (newBanDate && new Date(newBanDate) > baseDate) {
        baseDate = new Date(newBanDate);
      }
      baseDate.setDate(baseDate.getDate() + additionalDays);
      newBanDate = baseDate;
    }

    // Handling the games_didnt_show logic

    const bannedUntilStr = newBanDate
      ? newBanDate.toISOString().split("T")[0]
      : null;

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE Players SET banned_until = ?, games_left = ?, games_griefed = ?, bbb = ?, games_didnt_show = ? WHERE steam_id = ?`,
        [
          bannedUntilStr,
          games_left,
          games_griefed,
          bbb,
          games_didnt_show,
          String(steam_id),
        ],
        (err) => (err ? reject(err) : resolve())
      );
    });

    closeDatabase(db);
    return {
      success: true,
      message: `Player ${steam_id} updated successfully`,
    };
  } catch (error) {
    console.error("Error processing ban/unban:", error);
    closeDatabase(db);
    return { success: false, message: "Internal Server Error" };
  }
}
