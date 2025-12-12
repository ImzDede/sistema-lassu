"use client";

import React, { useState } from "react";
import { IconButton, Badge } from "@material-tailwind/react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationDialog from "./NotificationDialog";

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4 p-2 relative">
        <Badge
          content={unreadCount > 0 ? unreadCount.toString() : ""}
          invisible={unreadCount === 0}
          withBorder
          className="bg-red-500 min-w-[18px] min-h-[18px] text-xs font-bold"
        >
          <IconButton
            variant="text"
            onClick={() => setIsOpen(true)}
            className="p-5 group rounded-full h-8 w-8 text-gray-600 hover:bg-brand-purple hover:text-white transition-colors"
          >
            <Bell
              className={`w-5 h-5 transition-colors ${
                unreadCount > 0
                  ? "text-brand-purple group-hover:text-white"
                  : "text-current"
              }`}
            />
          </IconButton>
        </Badge>
      </div>

      <NotificationDialog open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
