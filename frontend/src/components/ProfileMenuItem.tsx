"use client";

import React from "react";
import Link from "next/link";
import {
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Typography,
} from "@material-tailwind/react";
import { ChevronRight } from "lucide-react";

interface ProfileMenuItemProps {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const ProfileMenuItem = ({ label, icon, href }: ProfileMenuItemProps) => {
  return (
    <Link href={href} className="text-initial block mb-1">
      <ListItem
        className="
          group h-16 rounded-xl border border-transparent
          transition-all duration-300
          hover:bg-[#A78FBF]/10 hover:border-[#A78FBF]/20
          focus:bg-[#A78FBF]/10 active:bg-[#A78FBF]/10
        "
        placeholder={undefined}
      >
        <ListItemPrefix placeholder={undefined}>
          <div
            className="
            p-2 rounded-lg shadow-sm transition-colors text-gray-500 bg-white
            group-hover:bg-white group-hover:text-[#A78FBF]
          "
          >
            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
          </div>
        </ListItemPrefix>

        <Typography
          className="
            font-bold uppercase text-sm ml-2 transition-colors
            text-gray-600 group-hover:text-[#A78FBF]
          "
          placeholder={undefined}
        >
          {label}
        </Typography>

        <ListItemSuffix placeholder={undefined}>
          <ChevronRight
            className="text-gray-300 transition-colors group-hover:text-[#D9A3B6]"
            size={20}
          />
        </ListItemSuffix>
      </ListItem>
    </Link>
  );
};

export default ProfileMenuItem;
