export const fetcher = async (url: string) => {
  const result = await fetch(url, {
    cache: "no-store",
  });

  const data = await result.json();

  return data;
};
