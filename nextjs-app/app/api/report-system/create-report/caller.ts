import { PrimitiveServiceResponse } from "@/app/services/common/types";
import type { ReportType } from "../../../services/userReport/getUserReports";
import axios from "axios";

export const apiCallerCreateReports = async (
    reportPayload: {
        user_steam_id: string;
        other_player_steam_id: string;
        type: ReportType;
        report: string;
        match_id?: number;
    }
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