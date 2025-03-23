import { headers } from "next/headers";

export const fetcher = async (url: string) => {
  const cookie = headers().get("cookie") || "";

  const result = await fetch(url, {
    cache: "no-store",
    headers: { cookie },
  });

  const data = await result.json();

  return data;
};
