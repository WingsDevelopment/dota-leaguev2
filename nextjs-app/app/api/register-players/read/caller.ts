import axios from "axios";
import { baseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { Vouch } from "@/app/services/registerPlayersService/readPlayers";


export const apiCallerGetRegisterPlayers2 = async (): Promise<Vouch[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/register-players/read`);
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
