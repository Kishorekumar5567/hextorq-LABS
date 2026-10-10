'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Bell, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function NotificationBell() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const notifications = db.getNotifications(currentUser.id);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-lg bg-[#0E1017] p-4 shadow-2xl z-50 border border-white/[0.1] animate-in fade-in duration-100">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-zinc-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-white/[0.08] text-zinc-300 font-mono px-1.5 py-0.2 rounded">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              onClick={() => {
                notifications.forEach(n => (n.is_read = true));
                setIsOpen(false);
              }}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 font-mono transition-colors"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          </div>

          <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto mt-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono text-center py-6">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="py-2.5 px-1 hover:bg-white/[0.02] rounded transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-zinc-200">{n.title}</p>
                    <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white mt-1.5 font-medium transition-colors"
                    >
                      View details <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
