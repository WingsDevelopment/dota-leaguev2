import { PrimitiveServiceResponse } from "@/app/services/common/types";
import axios from "axios";
import { userReport } from "@/app/services/userReport/createUserReport";
import { ApiCallerConfig } from "../../common/interfaces";
import { getBaseUrl } from "@/app/common/constraints";
import { Notify } from "@/lib/notification";

export const apiCallerCreateReports = async ({
    params: { reportPayload }, config
}: { params: { reportPayload: userReport }, config: ApiCallerConfig }
): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.put(`${getBaseUrl(config?.origin)}/api/report-system/create-report`,
            reportPayload, config);
        const data = response.data as PrimitiveServiceResponse;
        if (!data.success) throw new Error(data.message);
        return data;
    } catch (error) {
        Notify({
            message: `Failed to create the report! ${error}`,
            type: "error",
        });
        throw error;
    }
};