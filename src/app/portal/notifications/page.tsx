'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PortalNotificationsPage() {
  const { currentUser } = useAuth();
  const notifications = db.getNotifications(currentUser.id);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
            <span>PORTAL</span>
            <span>/</span>
            <span className="text-zinc-300">SYSTEM NOTIFICATIONS</span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Activity Alerts & Notifications</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time triggers for staging deployments, ticket updates, milestone sign-offs, and receipts.
          </p>
        </div>

        <button
          onClick={() => {
            notifications.forEach(n => (n.is_read = true));
            alert('Marked all as read');
          }}
          className="btn-secondary"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 rounded-lg bg-[#0E1017] border border-white/[0.07] font-mono">
            No pending notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-lg bg-[#0E1017] border space-y-2 transition-all ${
                !n.is_read ? 'border-zinc-500/40 bg-[#121520]' : 'border-white/[0.07]'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-100 text-sm">{n.title}</span>
                <span className="text-zinc-500 font-mono text-[10px]">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{n.message}</p>
              {n.link && (
                <Link
                  href={n.link}
                  className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-white font-medium pt-1 transition-colors"
                >
                  <span>Go to resource</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
