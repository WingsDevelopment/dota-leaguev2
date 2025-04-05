import { baseUrl } from "@/app/common/constraints";
import { RegisterPlayers } from "@/app/services/registerPlayersService/approvePlayers";
import { vouch } from "@/components/admin/register-crud";
import { fetcher } from "@/lib/fetch";

export const apiCallerGetPlayers = async (): Promise<vouch[]> => {
  const response = await fetcher(`${baseUrl}/api/register-players/register-players-read`);
  return response?.data || [];
};