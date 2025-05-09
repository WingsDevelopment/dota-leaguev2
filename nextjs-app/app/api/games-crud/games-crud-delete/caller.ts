import axios from "axios";
import { getBaseUrl } from "@/app/common/constraints";
import { ApiCallerConfig } from "../../common/interfaces";
import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { DeleteGameParams } from "@/app/services/gameService/deleteGame";


export const apiCallerGamesDelete = async ({
    params: { id, status, result }, config
}: { params: DeleteGameParams, config: ApiCallerConfig }): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.delete(`${getBaseUrl(config?.origin)}/api/games-crud/games-crud-delete`, {
            headers: config?.headers,
            data: { id, status, result }
        });
        const data = response.data;
        if (!data.success) throw new Error(data.message);
        config.onSuccessCallback(
            `Successfully deleted the game.`
        );

        return data.data;
    } catch (error) {
        config.onErrorCallback(`Failed to delete the game! ${error}`);
        throw error;
    } finally {
        config.onSettledCallback()
    }
};
