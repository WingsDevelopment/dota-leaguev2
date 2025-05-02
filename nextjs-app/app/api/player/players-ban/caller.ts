import axios from "axios";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { BanParams } from "@/app/services/playerService/banPlayer";
import { Notify } from "@/lib/notification";
import { ApiCallerConfig } from "../../common/interfaces";
import { getBaseUrl } from "@/app/common/constraints";

export const apiCallerBanPlayer = async (
    { params: { steam_id, banType }, config }: { params: BanParams, config: ApiCallerConfig }
): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.post(`${getBaseUrl(config?.origin)}/api/player/players-ban`,
            { steam_id, banType }, config
        );

        const data = response.data as PrimitiveServiceResponse;
        if (!data.success) throw new Error(data.message);

        return data;
    } catch (error) {
        Notify({
            message: `Failed to ban the player!, ${error}`,
            type: "error",
        });
        throw error;
    }
};
