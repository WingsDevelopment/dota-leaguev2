import axios from "axios";
import { baseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { LikedOrDisliked } from "@/app/services/likesAndDislikesService/isUserLikedOrDisliked";
import { PlayerVote } from "@/app/services/likesAndDislikesService/likesAndDislikes";
import { PrimitiveServiceResponse } from "@/app/services/common/types";

export const apiCallerPutLikeOrDislike = async ({
    userSteamId, otherPlayerSteamId, type
}: PlayerVote): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.post(`/api/likes-dislikes/like-and-dislike`, {
            userSteamId, otherPlayerSteamId, type
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
