import axios from "axios";
import { baseUrl } from "@/app/common/constraints";

export const axiosWrapper = axios.create({
  baseURL: baseUrl,
  headers: {},
});
