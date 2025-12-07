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
        className={`transition-all duration-300 group focus:outline-none
          ${
            active
              ? "bg-white/20 text-white font-bold hover:bg-white/20 hover:text-white focus:bg-white/20 focus:text-white active:bg-white/20 active:text-white shadow-none"
              : "text-white/70 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white active:bg-white/10 active:text-white"
          }
        `}
      >
        <ListItemPrefix>
          {React.cloneElement(icon, {
            className: `w-5 h-5 transition-colors ${
              active 
                ? "text-white"
                : "text-white/70 group-hover:text-white group-focus:text-white"
            }`,
          })}
        </ListItemPrefix>
        <Typography
          className="mr-auto font-medium text-sm uppercase tracking-wide"
        >
          {label}
        </Typography>
      </ListItem>
    </Link>
  );
};

export default NavItem;