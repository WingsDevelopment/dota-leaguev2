import { PrimitiveServiceResponse } from "@/app/services/common/types";
import axios from "axios";
import { userReport } from "@/app/services/userReport/createUserReport";

export const apiCallerCreateReports = async (
    reportPayload:userReport 
): Promise<PrimitiveServiceResponse> => {
    try {
        const response = await axios.put("/api/report-system/create-report", reportPayload);
        const data = response.data as PrimitiveServiceResponse;
        if (!data.success) throw new Error(data.message);
        return data;
    } catch (error) {
        console.error("Failed to create the report!", error);
        throw error;
    }
};