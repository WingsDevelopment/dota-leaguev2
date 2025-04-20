import { baseUrl } from "@/app/common/constraints";
import { Notify } from "@/app/lib/notification";
import { Vouch } from "../../../services/registerPlayersService/readPlayers";
import { axiosWrapper } from "../../../lib/fetch";

export const apiCallerGetRegisterPlayers2 = async (): Promise<Vouch[]> => {
  try {
    const response = await axiosWrapper.get(`${baseUrl}/api/register-players/read`);
    const data = response.data;
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
