import { PrimitiveServiceResponse } from "@/app/services/common/types";
import axios from "axios";
import { userReport } from "@/app/services/userReport/createUserReport";
import { RegisterPlayers } from "@/app/services/registerPlayersService/approvePlayers";
import { isUserAdmin } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";

export const apiCallersetDeclinePlayers = async ({
  registrationId,
  requestType,
}: RegisterPlayers): Promise<PrimitiveServiceResponse> => {
  try {
    if (!isUserAdmin()) {
      throw new Error("User is not authorized for this action.");
    }
    const response = await axios.post(
      "/api/register-players/register-players-decline",
      { registrationId, requestType }
    );
    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    Notify({
      message: `Failed to approve the player! ${error}`,
      type: "error",
    });
    throw error;
  }
};
