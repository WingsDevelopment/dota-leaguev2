import { headers } from "next/headers";
import type { ApiCallerConfig } from "@/app/api/common/interfaces";

export function getApiServerCallerConfig(): ApiCallerConfig {
  const cookie = headers().get("cookie") || "";

  return {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      cookie,
    },
    onSuccessCallback: (message: string) => console.log(message),
    onErrorCallback: () => console.error("Failed"),
    onSettledCallback: () => {},
  };
}
