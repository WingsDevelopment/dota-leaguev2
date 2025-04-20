import { headers } from "next/headers";
import axios from "axios";
import { baseUrl } from "@/app/common/constraints";

export const fetcher = async (url: string) => {
  const cookie = headers().get("cookie") || "";

  const result = await fetch(url, {
    cache: "no-store",
    headers: { cookie },
  });

  const data = await result.json();

  return data;
};

export const axiosWrapper = axios.create({
  baseURL: baseUrl,
  headers: {
    cookie: headers().get("cookie") || "",
  },
});
