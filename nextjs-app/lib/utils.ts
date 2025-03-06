import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateElo(
  radiantElo: number,
  direElo: number,
  result: number
): number {
  const k = 50;
  const expectedScoreRadiant =
    1 / (1 + Math.pow(10, (direElo - radiantElo) / 400));
  let actualScoreRadiant = (result + 1) / 2;
  if (radiantElo === direElo) {
    actualScoreRadiant = result === 1 ? 1 : 0;
  }
  const eloChange = k * (actualScoreRadiant - expectedScoreRadiant);
  return Math.round(Math.abs(eloChange));
}
