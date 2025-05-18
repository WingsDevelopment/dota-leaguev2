import { PrimitiveServiceResponse } from "@/app/services/common/types";
import axios from "axios";
import { userReport } from "@/app/services/userReport/createUserReport";
import { RegisterPlayers } from "@/app/services/registerPlayersService/approvePlayers";
import { getBaseUrl, isUserAdmin } from "@/app/common/constraints";
import { ApiCallerConfig } from "../../common/interfaces";
import { Notify } from "@/lib/notification";


export const apiCallersetApprovePlayers = async (
    { params: { registrationId, requestType }, config }: { params: RegisterPlayers, config: ApiCallerConfig }
): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.post(`${getBaseUrl(config?.origin)}/api/register-players/register-players-approve`,
            { registrationId, requestType }, config);
        const data = response.data as PrimitiveServiceResponse;
        if (!data.success) throw new Error(data.message);
        config.onSuccessCallback(
            `Successfully approved the player.`
        );
        return data;
    } catch (error) {
        config.onErrorCallback(`Failed to approve the player! ${error}`);
        throw error;
    } finally {
        config.onSettledCallback()
    }
};