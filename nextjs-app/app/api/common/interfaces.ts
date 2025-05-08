import { AxiosRequestConfig } from "axios";

export type Origin = "server" | "client" | undefined;
export interface ApiCallerConfig extends AxiosRequestConfig<any> {
  origin?: Origin; // if not specified it will be treated as "server"
  onSuccessCallback: (message: string) => void;
  onErrorCallback: (message: string) => void;
  onSettledCallback: () => void;
}