import axios from "axios";
import { getBaseUrl } from "@/app/common/constraints";
import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { Player } from "@/app/services/playerService/getPlayerBySteamId";
import { ApiCallerConfig } from "../../common/interfaces";
import { UpdateWinnerLoser } from "@/app/services/gameService/updateWinnerOrLoser";


export const apiCallerGamesDeclareWinnerOrLoser = async ({
    params: { id, status, team_won }, config
}: { params: UpdateWinnerLoser, config: ApiCallerConfig }): Promise<Player[]> => {
    try {
        const response = await axios.put(`${getBaseUrl(config?.origin)}/api/games-crud/games-crud-update-winner-loser`, {
            id, status, team_won
        }, config);

        const data = response.data;
        if (!data.success) throw new Error(data.message);
        config.onSuccessCallback(
            `Successfully updated winner/loser.`
        );
        return data.data;
    } catch (error) {
        config.onErrorCallback(`Failed to update winner/loser! ${error}`);
        throw error;
    } finally {
        config.onSettledCallback()
    }
};
