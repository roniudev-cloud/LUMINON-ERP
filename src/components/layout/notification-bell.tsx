"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/utils";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications";

type Notification = Awaited<ReturnType<typeof getMyNotifications>>["data"][number];

export function NotificationBell() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data, unreadCount } = await getMyNotifications();
    setItems(data);
    setUnreadCount(unreadCount);
  };

  useEffect(() => {
    const handle = setTimeout(load, 0);
    return () => clearTimeout(handle);
  }, []);

  const handleSelect = async (n: Notification) => {
    if (!n.isRead) {
      await markNotificationRead(n.id);
      setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, isRead: true } : it)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((it) => ({ ...it, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <DropdownMenu open={open} onOpenChange={(v) => { setOpen(v); if (v) load(); }}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-md hover:bg-accent transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-medium">Thông báo</p>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="h-3 w-3" /> Đánh dấu đã đọc
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground text-center">
              Không có thông báo nào.
            </p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleSelect(n)}
                className={`w-full text-left px-3 py-2 border-t hover:bg-accent transition-colors ${
                  !n.isRead ? "bg-accent/40" : ""
                }`}
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.content}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDateTime(n.createdAt)}
                </p>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
