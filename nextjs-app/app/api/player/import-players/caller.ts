import axios from "axios";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { Leaderboard } from "@/app/services/playerService/importPlayers";
import { Notify } from "@/lib/notification";

export const apiCallerImportPlayers = async (
  { leaderboard }: Leaderboard
): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axios.post("/api/player/import-players", {
      leaderboard
    });

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);

    return data;
  } catch (error) {
    Notify({
      message: `Failed to import the players!, ${error}`,
      type: "error",
    });
    throw error;
  }
};