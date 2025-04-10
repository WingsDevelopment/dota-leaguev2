import axios from "axios";
import type { PrimitiveServiceResponse } from "../../../services/common/types";
import { BanParams } from "@/app/services/playerService/banPlayer";
import { Notify } from "@/lib/notification";

export const apiCallerBanPlayer = async (
    { steam_id, banType }: BanParams
): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.post("/api/player/players-ban", {
            steam_id, banType
        });

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
