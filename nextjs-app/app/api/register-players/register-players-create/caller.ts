import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { Notify } from "@/app/lib/notification";
import { axiosWrapper } from "../../../lib/fetch";
interface PlayerDataFromInput {
  steam_id: number;
  mmr: number;
}
export const apiCallerCreatePlayers = async ({
  steam_id,
  mmr,
}: PlayerDataFromInput): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axiosWrapper.put(
      "/api/register-players/register-players-create",
      { steam_id, mmr }
    );
    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    Notify({
      message: `Failed to approve the player! ${error}`,
      type: "error",
    });
    throw error;
  }
};
