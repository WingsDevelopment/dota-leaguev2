import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { PlayerDataVouch } from "@/app/services/registerPlayersService/createPlayers";
import axios from "axios";
interface PlayerDataFromInput{
    steam_id:number,
    mmr:number
}
export const apiCallerCreatePlayers = async (
    {steam_id,
    mmr}:PlayerDataFromInput
): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.put("/api/register-players/register-players-create", { steam_id, mmr });
        const data = response.data as PrimitiveServiceResponse;
        if (!data.success) throw new Error(data.message);
        return data;
    } catch (error) {
        console.error("Failed to vouch the player!", error);
        throw error;
    }
};