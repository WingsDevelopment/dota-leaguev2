import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { DeletePlayer } from "@/app/services/registerPlayersService/deletePlayers";
import { axiosWrapper } from "../../../../lib/fetch";

export const apiCallerDeletePlayers = async ({
  steam_id,
}: DeletePlayer): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axiosWrapper.delete(
      "/api/register-players/register-players-delete",
      {
        data: { steam_id },
      }
    );
    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    console.error("Failed to delete the player!", error);
    throw error;
  }
};
