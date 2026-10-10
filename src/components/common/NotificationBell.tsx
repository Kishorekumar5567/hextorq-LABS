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
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-[#080C15] animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl glass-panel-elevated p-4 shadow-2xl z-50 border border-slate-700/60 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              onClick={() => {
                notifications.forEach(n => (n.is_read = true));
                setIsOpen(false);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto mt-2">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="py-2.5 px-1 hover:bg-slate-800/40 rounded-lg transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-slate-200">{n.title}</p>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 mt-1.5 font-medium"
                    >
                      View details <ExternalLink className="w-2.5 h-2.5" />
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
