import { baseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";
import { MatchHistory } from "@/app/matchHistory/[id]/page";
import { MatchHistoryParams } from "@/app/services/matchHistoryService/getMatchHistory";
import { axiosWrapper } from "../../../../lib/fetch";

export const apiCallerGetMatchHistory = async ({
  steamId,
}: MatchHistoryParams): Promise<MatchHistory[]> => {
  try {
    const response = await axiosWrapper.get(
      `${baseUrl}/api/match-history-players/show-history`,
      {
        params: { steamId },
      }
    );

    const data = response.data;
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    Notify({
      message: `Failed to get match history! ${error}`,
      type: "error",
    });
    throw error;
  }
};
