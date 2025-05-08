import { Notify } from "@/lib/notification";
import { ApiCallerConfig } from "./interfaces";

export function getApiClientCallerConfig(): ApiCallerConfig {
  return {
    origin: "client",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    onSuccessCallback: (message: string) => Notify({ message, type: "success" }),
    onErrorCallback: () => Notify({ message: "Failed", type: "error" }),
    onSettledCallback: () => {},
  };
}