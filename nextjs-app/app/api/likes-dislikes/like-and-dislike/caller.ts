import axios from "axios";
import { getBaseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { PlayerVote } from "@/app/services/likesAndDislikesService/likesAndDislikes";
import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallerPutLikeOrDislike = async ({
    params: { userSteamId, otherPlayerSteamId, type }, config
}: { params: PlayerVote, config: ApiCallerConfig }): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.post(`${getBaseUrl(config?.origin)}/api/likes-dislikes/like-and-dislike`, {
            userSteamId, otherPlayerSteamId, type
        }, config);

        const data = response.data as PrimitiveServiceResponse;
        if (!data.success) throw new Error(data.message);
        return data;
    } catch (error) {
        Notify({
            message: `Failed to like or dislike! ${error}`,
            type: "error",
        });
        throw error;
    }finally{
        config.onSettledCallback()
    }
};
