import { getDbInstance } from "@/db/utils";
import { closeDatabase } from "@/db/initDatabase";
import { getPrimitiveServiceErrorResponse, getSuccessfulServiceResponse, runDbAll, runDbQuery } from "../common/functions";
/* ------------- */
/*   Interfaces  */
/* ------------- */
export interface BanParams {
  steam_id: number;
  banType?: "1l" | "1g" | "bbb" | "1d"; // Only required for bans
}
export interface PlayerBanData {
  banned_until: string | null;
  games_left: number;
  games_griefed: number;
  bbb: number;
  games_didnt_show: number;
}
/**
 * Bans player by bantype and steamId.
 *
 * @async
 * @function banPlayer
 * @param {BanParams} params - The object containing identifiers for the ban.
 * @returns {Promise<PrimitiveServiceResponse>} A promise that resolves to a primitive service response.
 *
 * @example
 * const response = await banPlayer({ steam_id: 12345, banType:"bbb" });
 */
export async function banPlayer({
  steam_id,
  banType,
}: BanParams) {
  /* ------------------ */
  /*   Initialization   */
  /* ------------------ */
  const db = await getDbInstance();
  try {
    /* ------------- */
    /*   Validation  */
    /* ------------- */
    if (!steam_id || !banType) {
      throw new Error("Missing player steam id or ban value");
    }
    // Fetch the player's ban info
    const players: PlayerBanData[] = await runDbAll(
      db,
      `SELECT banned_until, games_didnt_show, games_left, games_griefed, bbb FROM Players WHERE steam_id = ?`,
      [String(steam_id)]
    );
    /* ------------- */
    /*   Validation  */
    /* ------------- */
    const player = players[0]
    if (!player) {
      throw new Error("Player not found");
    }
    let { banned_until, games_left, games_griefed, bbb, games_didnt_show } =
      player;
    let newBanDate = banned_until ? new Date(banned_until) : undefined;
    /* ------------ */
    /*  Ban Logic   */
    /* ------------ */
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
    /* ------------- */
    /*   DB Query    */
    /* ------------- */
    await runDbQuery(
      db,
      `UPDATE Players SET banned_until = ?, games_left = ?, games_griefed = ?, bbb = ?, games_didnt_show = ? WHERE steam_id = ?`,
      [
        bannedUntilStr,
        games_left,
        games_griefed,
        bbb,
        games_didnt_show,
        String(steam_id),
      ]
    );

    /* ---------------- */
    /*   Return Data    */
    /* ---------------- */
    return getSuccessfulServiceResponse({
      message: "Player ban status updated successfully"
    });
  } catch (error) {
    /* -------- */
    /*   Error  */
    /* -------- */
    return getPrimitiveServiceErrorResponse(error, "Error deleting player by discord ID.");
  } finally {
    /* -------- */
    /*  Cleanup */
    /* -------- */
    closeDatabase(db)
  }
}
