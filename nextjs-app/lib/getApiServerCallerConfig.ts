import { headers } from "next/headers";

export function getApiServerCallerConfig() {
  const cookie = headers().get("cookie") || "";

  return {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      cookie,
    },
  };
}