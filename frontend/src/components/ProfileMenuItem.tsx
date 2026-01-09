"use client";

import React from "react";
import Link from "next/link";
import { ListItem, ListItemPrefix, ListItemSuffix, Typography } from "@material-tailwind/react";
import { ChevronRight } from "lucide-react";

interface ProfileMenuItemProps {
  label: string;
  icon: React.ReactElement;
  href: string;
}

const ProfileMenuItem = ({ label, icon, href }: ProfileMenuItemProps) => {
  return (
    <Link href={href} className="text-initial block mb-2">
      <ListItem className="group h-16 rounded-xl border border-transparent transition-all duration-300 hover:bg-brand-purple/5 hover:border-brand-purple/20 focus:bg-brand-purple/5 active:bg-brand-purple/5">
        <ListItemPrefix>
          <div className="p-2.5 rounded-lg shadow-sm transition-colors text-gray-400 bg-white group-hover:bg-brand-purple/10 group-hover:text-brand-purple group-hover:shadow-md">
            {React.cloneElement(icon, { size: 20 })}
          </div>
        </ListItemPrefix>
        <Typography className="font-bold uppercase text-sm ml-2 transition-colors text-gray-500 group-hover:text-brand-dark font-heading tracking-wide">
          {label}
        </Typography>
        <ListItemSuffix>
          <ChevronRight className="text-gray-300 transition-colors group-hover:text-brand-purple" size={18} />
        </ListItemSuffix>
      </ListItem>
    </Link>
  );
};

export default ProfileMenuItem;
