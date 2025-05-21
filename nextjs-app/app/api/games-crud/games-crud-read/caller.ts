import axios from "axios";
import { getBaseUrl } from "@/app/common/constraints";

import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { Player } from "@/app/services/playerService/getPlayerBySteamId";
import { ApiCallerConfig } from "../../common/interfaces";
import { Game } from "@/components/admin/games-crud";


export const apiCallerGamesRead = async ({
    config
}: { config: ApiCallerConfig }): Promise<Game[]> => {
    try {
        const response = await axios.get(`${getBaseUrl(config?.origin)}/api/games-crud/games-crud-read`, 
            config
        );
        const data = response.data;
        if (!data.success) throw new Error(data.message);
        config.onSuccessCallback("Succesfully fetched games.")
        return data.data;
    } catch (error) {
        config.onErrorCallback("Falied to get the games!")
        throw error;
    }finally{
        config.onSettledCallback()
    }
};
