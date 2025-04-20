import { Notify } from "@/lib/notification";
import { PlayerVote } from "@/app/services/likesAndDislikesService/likesAndDislikes";
import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { axiosWrapper } from "../../../../lib/fetch";

export const apiCallerPutLikeOrDislike = async ({
  userSteamId,
  otherPlayerSteamId,
  type,
}: PlayerVote): Promise<PrimitiveServiceResponse> => {
  try {
    const response = await axiosWrapper.post(`/api/likes-dislikes/like-and-dislike`, {
      userSteamId,
      otherPlayerSteamId,
      type,
    });

    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    Notify({
      message: `Failed to like or dislike! ${error}`,
      type: "error",
    });
    throw error;
  }
};
