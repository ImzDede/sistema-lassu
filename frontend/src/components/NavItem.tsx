"use client";

import React from "react";
import Link from "next/link";
import { ListItem, ListItemPrefix, Typography } from "@material-tailwind/react";

interface NavItemProps {
  icon: React.ReactElement;
  label: string;
  href: string;
  active?: boolean;
}

const NavItem = ({ icon, label, href, active = false }: NavItemProps) => {
  return (
    <Link href={href} className="block w-full mb-1">
      <ListItem
        selected={active}
        className={`transition-all duration-300 ${
          active
            ? "bg-[#A78FBF]/10 text-[#A78FBF] focus:bg-[#A78FBF]/10 hover:bg-[#A78FBF]/10 border-r-4 border-[#A78FBF] rounded-r-none shadow-none"
            : "text-gray-500 hover:bg-[#D9A3B6]/10 hover:text-[#A78FBF]"
        }`}
        placeholder={undefined}
      >
        <ListItemPrefix placeholder={undefined}>
          {React.cloneElement(
            icon as React.ReactElement<{ className: string }>,
            {
              className: `w-5 h-5 transition-colors ${
                active
                  ? "text-[#A78FBF]"
                  : "text-gray-400 group-hover:text-[#A78FBF]"
              }`,
            }
          )}
        </ListItemPrefix>
        <Typography
          className={`mr-auto font-medium text-sm uppercase tracking-wide ${
            active ? "font-bold" : ""
          }`}
          placeholder={undefined}
        >
          {label}
        </Typography>
      </ListItem>
    </Link>
  );
};

export default NavItem;
