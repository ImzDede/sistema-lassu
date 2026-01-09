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
          className="bg-feedback-error-main min-w-[18px] min-h-[18px] text-xs font-bold border-white"
        >
          <IconButton
            variant="text"
            onClick={() => setIsOpen(true)}
            className="p-2 group rounded-full h-10 w-10 text-gray-500 hover:bg-brand-purple/10 hover:text-brand-purple transition-all"
          >
            <Bell
              className={`w-6 h-6 transition-colors ${
                unreadCount > 0
                  ? "text-brand-purple fill-brand-purple/20 animate-pulse"
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
