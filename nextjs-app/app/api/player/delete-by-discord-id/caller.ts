import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { getPlayerByDiscordId } from "@/app/services/playerService/getPlayerSteamIdByDiscordId";
import { Notify } from "@/app/lib/notification";
import { axiosWrapper } from "../../../lib/fetch";

export const apiCallerDeletePlayerBySteamId = async ({
  discordId,
}: getPlayerByDiscordId): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axiosWrapper.post("/api/player/delete-by-discord-id", {
      data: { discordId },
    });

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);

    return data;
  } catch (error) {
    Notify({
      message: `Failed to delete player by discord Id.!", ${error}`,
      type: "error",
    });
    throw error;
  }
};
