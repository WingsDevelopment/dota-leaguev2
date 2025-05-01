import { Notify } from "@/lib/notification";

// difference between import { Notify } and import type { ApiCallerConfig } read:
// Brings in a value (class, function, constant, etc.) that you actually use at runtime.
// Emits a real import in the compiled JavaScript so that Notify is available when your code runs.
// import type { ApiCallerConfig } …
// Brings in only a TypeScript type (an interface, type alias, etc.) for static checking.
// Is completely erased from the emitted JS—no import statement will appear in your bundle for ApiCallerConfig.

// simply put import type {.. never actually happend in production.
import type { ApiCallerConfig } from "./interfaces";

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
