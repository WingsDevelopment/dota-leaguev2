import axios from "axios";
import { getBaseUrl } from "@/app/common/constraints";
import { SumOfLikesAndDislikes } from "@/app/services/likesAndDislikesService/getLikesAndDislikes";
import { ApiCallerConfig } from "../../common/interfaces";

export const apiCallerGetLikesAndDislikesBySteamId = async ({
  params: { steam_id },  config 
}: { params: { steam_id: string },  config: ApiCallerConfig  }): Promise<SumOfLikesAndDislikes> => {
  try {
    const response = await axios.get(`${getBaseUrl(config?.origin)}/api/likes-dislikes/get-likes-and-dislikes`, {
      params: { steam_id, config }
    });

    const data = response.data;
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error(`Failed to get likes and dislikes for requested steam Id!`, error);
    throw error;
  } finally {
    config.onSettledCallback()
  }
};
