import axios from "axios";
import { Player } from "@/components/admin/player-crud";
import { baseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";

export const apiCallerGetPlayers = async (
): Promise<Player[]> => {
    try {
        const response = await axios.get(`${baseUrl}/api/player/players-read`);
        const data = response.data
        if (!data.success) throw new Error(data.message);
        return data.data;
    } catch (error) {
        Notify({
            message: `Failed to fetch the players!, ${error}`,
            type: "error",
        });
        throw error;
    }
};
