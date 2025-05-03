import axios from "axios";
import { getBaseUrl } from "@/app/common/constraints";
import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { Player } from "@/app/services/playerService/getPlayerBySteamId";
import { ApiCallerConfig } from "../../common/interfaces";


export const apiCallerGamesUpdateOrCancel = async ({
    config
}: { config: ApiCallerConfig }): Promise<Player[]> => {
    try {
        const response = await axios.delete(`${getBaseUrl(config?.origin)}/games-crud/games-crud-update-cancel`, {
            params: { config }
        });

        const data = response.data;
        if (!data.success) throw new Error(data.message);
        return data.data;
    } catch (error) {
        console.error(`Failed to get leaderboard!`, error);
        throw error;
    }
};
