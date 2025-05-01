import axios from "axios";
import { baseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { isUserLikerOrDisliked, LikedOrDisliked } from "@/app/services/likesAndDislikesService/isUserLikedOrDisliked";

export const apiCallerisUserLikedOrDisliked = async ({
    userSteamId, otherPlayerSteamId
}: isUserLikerOrDisliked): Promise<LikedOrDisliked> => {
    try {
        const response = await axios.get(`${baseUrl}/api/likes-dislikes/is-user-liked-or-disliked`, {
            params: { userSteamId, otherPlayerSteamId }
        });

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
