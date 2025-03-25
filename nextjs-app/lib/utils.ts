import { heroMap, itemMap } from "@/app/matchHistory/[id]/hero_and_items_images";
import { UserProfileProps } from "@/components/userProfile/userProfile";
import { type ClassValue, clsx } from "clsx";
import { intervalToDuration } from "date-fns";
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

export function formatDuration(seconds: number) {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  return `${duration.hours ?? 0}h ${duration.minutes ?? 0}m ${duration.seconds ?? 0}s`;
};

export function getHeroImage(heroId: number) {
  const heroName = heroMap[heroId];
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png`
}
export function getItemImage(items: string) {
  const itemArray = JSON.parse(items)
  const itemLink = itemArray.map((itemid: string) => {
    const num = itemMap[itemid]
    return [`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/items/${num}_lg.png`, num]
  })
  return itemLink;
}

export function heroToUppercase(name: string) {
  let stringSplit = name.split('_');
  for (let i = 0; i < stringSplit.length; i++) {
    stringSplit[i] = stringSplit[i].charAt(0).toUpperCase() + stringSplit[i].substring(1);
  }
  return stringSplit.join(' ');
}

export function getAvatarUrl(anyString: String) {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${anyString}`;
}

export function mapUserDataToViewModel(user:UserProfileProps["user"]) {
  const wins = Number(user?.wins) || 0;
  const loses = Number(user?.loses) || 0;

  const totalGames = wins + loses;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  const formattedDate = user.vouched_date
    ? new Date(user.vouched_date).toLocaleString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // 24-hour format
    })
    : "Not Available"; // Fallback text if no date

  return {
    winRate:winRate,
    formattedDate:formattedDate
  }
}