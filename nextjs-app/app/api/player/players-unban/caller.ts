import axios from "axios";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { BanParams } from "@/app/services/playerService/banPlayer";
import { Notify } from "@/lib/notification";

export const apiCallerUnbanPlayer = async (
    { steam_id }: BanParams
): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.put("/api/player/players-unban", {
            steam_id
        });

        const data = response.data as PrimitiveServiceResponse;
        if (!data.success) throw new Error(data.message);

        return data;
    } catch (error) {
        Notify({
            message: `Failed to unban the player!, ${error}`,
            type: "error",
        });
        throw error;
    }
};
