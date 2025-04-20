import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { Notify } from "@/app/lib/notification";
import { axiosWrapper } from "../../../lib/fetch";

export const apiCallerDeletePlayerBySteamId = async ({
  steamId,
}: {
  steamId: string;
}): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axiosWrapper.post("/api/player/delete-by-steam-id", {
      data: { steamId },
    });

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);

    return data;
  } catch (error) {
    Notify({
      message: `Failed to delete player by steam Id!, ${error}`,
      type: "error",
    });
    throw error;
  }
};
