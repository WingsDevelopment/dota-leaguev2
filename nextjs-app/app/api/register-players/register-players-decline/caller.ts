import { PrimitiveServiceResponse } from "@/app/services/common/types";
import axios from "axios";
import { userReport } from "@/app/services/userReport/createUserReport";
import { RegisterPlayers } from "@/app/services/registerPlayersService/approvePlayers";


export const apiCallersetDeclinePlayers = async (
    { registrationId, requestType }: RegisterPlayers
): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.post("/api/register-players/register-players-decline", { registrationId, requestType });
        const data = response.data as PrimitiveServiceResponse;
        if (!data.success) throw new Error(data.message);
        return data;
    } catch (error) {
        console.error("Failed to approve the player!", error);
        throw error;
    }
};