import axios from "axios";
import { getBaseUrl } from "@/app/common/constraints";
import { Player } from "@/app/services/playerService/getPlayerBySteamId";
import { ApiCallerConfig } from "../../common/interfaces";
import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { DeleteGameParams } from "@/app/services/gameService/deleteGame";


export const apiCallerGamesDelete = async ({
    params: { id, status, result }, config
}: { params: DeleteGameParams, config: ApiCallerConfig }): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.delete(`${getBaseUrl(config?.origin)}/games-crud/games-crud-delete`, {
            ...config,
            params: { id, status, result }
        });

        const data = response.data;
        if (!data.success) throw new Error(data.message);
        return data.data;
    } catch (error) {
        console.error(`Failed to delete the player!`, error);
        throw error;
    }
};
