import { baseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import {
  isUserLikerOrDisliked,
  LikedOrDisliked,
} from "@/app/services/likesAndDislikesService/isUserLikedOrDisliked";
import { axiosWrapper } from "../../../../lib/fetch";

export const apiCallerisUserLikedOrDisliked = async ({
  userSteamId,
  otherPlayerSteamId,
}: isUserLikerOrDisliked): Promise<LikedOrDisliked> => {
  try {
    const response = await axiosWrapper.get(
      `${baseUrl}/api/likes-dislikes/is-user-liked-or-disliked`,
      {
        params: { userSteamId, otherPlayerSteamId },
      }
    );

    const data = response.data;
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    Notify({
      message: `Failed to get info if user is liked or disliked! ${error}`,
      type: "error",
    });
    throw error;
  }
};
