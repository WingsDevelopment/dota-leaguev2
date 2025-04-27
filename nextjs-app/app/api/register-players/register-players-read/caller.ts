import { getApiServerCallerConfig } from "@/lib/getApiServerCallerConfig";

import axios from "axios";
import { Vouch } from "../../../services/registerPlayersService/readPlayers";

export const apiCallerGetPlayers = async (): Promise<Vouch[]> => {
  try {
    const response = await axios.get(
      `/api/register-players/register-players-read`,
      getApiServerCallerConfig()
    );
    const data = response.data;

    if (!data.success) throw new Error(data.message);

    return data.data;
  } catch (error) {
    console.error(`Failed to fetch players`, error);
    throw error;
  }
};
