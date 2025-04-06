import { baseUrl, isUserAdmin } from "@/app/common/constraints";
import { RegisterPlayers } from "@/app/services/registerPlayersService/approvePlayers";
import { vouch } from "@/components/admin/register-crud";
import { fetcher } from "@/lib/fetch";
import axios from "axios";

export const apiCallerGetPlayers = async (): Promise<vouch[]> => {
  try {
    if (!(await isUserAdmin())) {
      throw new Error("Access Denied.")
    }
    const response = await axios.get(`${baseUrl}/api/register-players/register-players-read`);
    const data = response.data
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error("Failed to vouch the player!", error);
    throw error;
  }
};