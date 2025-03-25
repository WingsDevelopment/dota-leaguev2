"use client";

import Link from "next/link";
import Image from "next/image";

const size = 36;

export default function SocialLinks() {
  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2">
      <div className="flex flex-col items-center space-y-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
        <Link
          href="https://discord.gg/ryJB5FfuwV"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/icons/discord.svg"
            alt="Discord"
            width={size}
            height={size}
          />
        </Link>
        <Link
          href="https://www.youtube.com/@komsa-y5k/videos"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/icons/youtube.svg"
            alt="YouTube"
            width={size}
            height={size}
          />
        </Link>
      </div>
    </div>
  );
}
