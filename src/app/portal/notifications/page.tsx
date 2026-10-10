'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Bell, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PortalNotificationsPage() {
  const { currentUser } = useAuth();
  const notifications = db.getNotifications(currentUser.id);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Notifications</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time updates regarding your staging builds, tickets, milestones, and invoices.
          </p>
        </div>

        <button
          onClick={() => {
            notifications.forEach(n => (n.is_read = true));
            alert('Marked all as read');
          }}
          className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 rounded-2xl glass-panel border border-slate-800">
            No notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl glass-panel border space-y-2 transition-all ${
                !n.is_read ? 'border-purple-500/40 bg-purple-950/10' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white text-sm">{n.title}</span>
                <span className="text-slate-500 text-[11px]">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
              {n.link && (
                <Link
                  href={n.link}
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium pt-1"
                >
                  <span>Go to details</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
