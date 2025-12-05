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
            ? "bg-deep-purple-50 text-deep-purple-700 focus:bg-deep-purple-50 hover:bg-deep-purple-50 border-r-4 border-deep-purple-600 rounded-r-none shadow-sm"
            : "text-blue-gray-500 hover:bg-gray-100 hover:text-deep-purple-500"
        }`}
      >
        <ListItemPrefix>
          {React.cloneElement(
            icon as React.ReactElement<{ className: string }>,
            {
              className: `w-5 h-5 transition-colors ${
                active
                  ? "text-deep-purple-700"
                  : "text-blue-gray-400 group-hover:text-deep-purple-500"
              }`,
            }
          )}
        </ListItemPrefix>
        <Typography
          className={`mr-auto font-medium text-sm uppercase tracking-wide ${
            active ? "font-bold" : ""
          }`}
        >
          {label}
        </Typography>
      </ListItem>
    </Link>
  );
};

export default NavItem;
