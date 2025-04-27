import { baseUrl } from "@/app/common/constraints";
import { vouch } from "@/components/admin/register-crud";
import { getApiServerCallerConfig } from "@/lib/getApiServerCallerConfig";


import axios from "axios";

export const apiCallerGetPlayers = async (): Promise<vouch[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/register-players/register-players-read`,
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