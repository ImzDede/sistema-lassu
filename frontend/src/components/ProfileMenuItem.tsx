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
    <Link href={href} className="text-initial block mb-1">
      <ListItem className="group h-16 rounded-xl border border-transparent transition-all duration-300 hover:bg-brand-purple/10 hover:border-brand-purple/20 focus:bg-brand-purple/10 active:bg-brand-purple/10">
        <ListItemPrefix>
          <div className="p-2 rounded-lg shadow-sm transition-colors text-gray-500 bg-brand-surface group-hover:bg-brand-surface group-hover:text-brand-purple">
            {React.cloneElement(icon, { size: 20 })}
          </div>
        </ListItemPrefix>
        <Typography className="font-bold uppercase text-sm ml-2 transition-colors text-gray-600 group-hover:text-brand-dark">
          {label}
        </Typography>
        <ListItemSuffix>
          <ChevronRight className="text-gray-300 transition-colors group-hover:text-brand-pink" size={20} />
        </ListItemSuffix>
      </ListItem>
    </Link>
  );
};

export default ProfileMenuItem;
