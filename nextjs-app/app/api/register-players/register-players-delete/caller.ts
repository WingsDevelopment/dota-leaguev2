import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { PlayerDataVouch } from "@/app/services/registerPlayersService/createPlayers";
import { DeletePlayer } from "@/app/services/registerPlayersService/deletePlayers";
import axios from "axios";

export const apiCallerDeletePlayers = async (
    {steam_id,
}:DeletePlayer
): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.delete("/api/register-players/register-players-delete", {data: {steam_id}});
        const data = response.data as PrimitiveServiceResponse;
        if (!data.success) throw new Error(data.message);
        return data;
    } catch (error) {
        console.error("Failed to vouch the player!", error);
        throw error;
    }
};