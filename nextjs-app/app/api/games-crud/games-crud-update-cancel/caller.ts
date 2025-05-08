import axios from "axios";
import { getBaseUrl } from "@/app/common/constraints";
import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { ApiCallerConfig } from "../../common/interfaces";
import { Notify } from "@/lib/notification";
import { CanceledGames } from "@/app/services/gameService/cancelPregameOrHostedGame";


export const apiCallerGamesUpdateOrCancel = async ({
    params: { id, status }, config
}: { params: CanceledGames, config: ApiCallerConfig }): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.put(`${getBaseUrl(config?.origin)}/api/games-crud/games-crud-update-cancel`, {
            id, status
        }, config);
        const data = response.data;
        if (!data.success) throw new Error(data.message);
        return data.data;
    } catch (error) {
        Notify({
            message: `Failed to cancel the game! ${error}`,
            type: "error",
        });
        throw error;
    } finally {
        config.onSettledCallback()
    }
};
