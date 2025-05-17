import axios from "axios";
import { baseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { isUserLikerOrDisliked, LikedOrDisliked } from "@/app/services/likesAndDislikesService/isUserLikedOrDisliked";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallerisUserLikedOrDisliked = async ({
    params: { userSteamId, otherPlayerSteamId }, config
}: { params: isUserLikerOrDisliked, config: ApiCallerConfig }): Promise<LikedOrDisliked> => {
    try {
        const response = await axios.get(`${baseUrl}/api/likes-dislikes/is-user-liked-or-disliked`, {
            ...config,
            params: { userSteamId, otherPlayerSteamId }
        });

        const data = response.data;
        if (!data.success) throw new Error(data.message);
        config.onSuccessCallback(
            `Successfully fetched info if user is liked or disliked.`
        );

        return data.data;
    } catch (error) {
        config.onErrorCallback(`Failed to fetch info if user is liked or disliked! ${error}`);
        throw error;
    } finally {
        config.onSettledCallback()
    }
};
