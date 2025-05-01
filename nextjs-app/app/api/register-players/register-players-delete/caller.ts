import { PrimitiveServiceResponse } from "@/app/services/common/types";
import { DeletePlayer } from "@/app/services/registerPlayersService/deletePlayers";
import axios from "axios";
import { ApiCallerConfig } from "../../common/interfaces";
import { getBaseUrl } from "@/app/common/constraints";
import { headers } from "next/headers";

export const apiCallerDeletePlayers = async ({
  params: { steam_id }, config
}: { params: { steam_id: DeletePlayer }, config: ApiCallerConfig }): Promise<PrimitiveServiceResponse> => {
  // Needs to be tested when DELETE is implemented on front.
  try {
    const response = await axios.delete(`${getBaseUrl(config?.origin)}/api/register-players/register-players-delete`,
      {
        params: { steam_id },
        headers: config?.headers
      }
    );
    const data = response.data as PrimitiveServiceResponse;
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    console.error("Failed to delete the player!", error);
    throw error;
  }
};
