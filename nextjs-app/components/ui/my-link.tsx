import Link from "next/link";
import React from "react";

export const MyLink: React.FC<{
  children: React.ReactNode;
  href: string;
}> = ({ children, href }) => {
  return (
    <Link href={href} className="text-blue-600 hover:underline">
      {children}
    </Link>
  );
};
