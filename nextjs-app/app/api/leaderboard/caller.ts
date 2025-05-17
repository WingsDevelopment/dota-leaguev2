import axios from "axios";
import { getBaseUrl } from "@/app/common/constraints";
import { ApiCallerConfig } from "../common/interfaces";
import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { Player } from "@/app/services/playerService/getPlayerBySteamId";


export const apiCallerGetLeaderBoard = async ({
    config
}: { config: ApiCallerConfig }): Promise<Player[]> => {
    try {
        const response = await axios.get(`${getBaseUrl(config?.origin)}/api/leaderboard`, {
            params: { config }
        });

        const data = response.data;
        if (!data.success) throw new Error(data.message);
        config.onSuccessCallback(
            `Successfully fetched leaderboard.`
        );
        return data.data;
    } catch (error) {
        config.onErrorCallback(`Failed to fetch the leaderboard! ${error}`);
        throw error;
    } finally {
        config.onSettledCallback()
    }
};
