import { ApiCallerConfig } from "./interfaces";

export function getApiClientCallerConfig(): ApiCallerConfig {
  return {
    origin: "client",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
}