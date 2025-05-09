import axios from "axios";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { BanParams } from "@/app/services/playerService/banPlayer";
import { Notify } from "@/lib/notification";
import { ApiCallerConfig } from "../../common/interfaces";
import { getBaseUrl } from "@/app/common/constraints";

export const apiCallerUnbanPlayer = async (
    { params: { steam_id }, config }: { params: BanParams, config: ApiCallerConfig }
): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.put(`${getBaseUrl(config?.origin)}/api/player/players-unban`,
            { steam_id }, config
        );

        const data = response.data as PrimitiveServiceResponse;
        if (!data.success) throw new Error(data.message);
        config.onSuccessCallback(
            `Successfully unbanned the player.`
        );
        return data;
    } catch (error) {
        config.onErrorCallback(`Failed to unban the player! ${error}`);
        throw error;
    } finally {
        config.onSettledCallback()
    }
};
