import axios from "axios";
import { Player } from "@/components/admin/player-crud";
import { baseUrl } from "@/app/common/constraints";

export const apiCallerGetPlayers = async (
): Promise<Player[]> => {
    try {
        const response = await axios.get(`${baseUrl}/api/player/players-read`);
        const data = response.data
        if (!data.success) throw new Error(data.message);
        return data.data;
    } catch (error) {
        console.error("Failed to fetch the players!", error);
        throw error;
    }
};
