import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { RegisterPlayers } from "@/app/services/registerPlayersService/approvePlayers";
import { isUserAdmin } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { axiosWrapper } from "../../../../lib/fetch";

export const apiCallersetDeclinePlayers = async ({
  registrationId,
  requestType,
}: RegisterPlayers): Promise<PrimitiveServiceResponse> => {
  try {
    if (!isUserAdmin()) {
      throw new Error("User is not authorized for this action.");
    }
    const response = await axiosWrapper.post(
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
