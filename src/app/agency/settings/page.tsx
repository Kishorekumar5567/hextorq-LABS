'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Settings, ShieldCheck, Key, Globe, CreditCard, Video, Database } from 'lucide-react';

export default function AgencySettingsPage() {
  const { isAgencyAdmin } = useAuth();

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Agency Security & Integrations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographic keys, Vercel preview host policies, payment gateway webhooks, and LiveKit configuration.
        </p>
      </div>

      <div className="space-y-6">
        {/* Vercel Host Policy Box */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Vercel Deployment Host Security Policy</h3>
              <p className="text-xs text-slate-400">Restricts visual feedback registrations to verified domains.</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-slate-300 font-medium block">Approved Host Patterns (Comma-separated)</label>
            <input
              type="text"
              readOnly
              value=".vercel.app, .nexus-clients.com, localhost"
              className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Submissions outside these domains are rejected with HTTP 403 by server policy.
            </p>
          </div>
        </div>

        {/* LiveKit Video Room Settings */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">LiveKit Video Cloud Provider</h3>
              <p className="text-xs text-slate-400">Managed WebRTC mesh for synchronized client meetings.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[11px]">Server WebSockets URL</span>
              <p className="font-mono text-slate-200">wss://demo.livekit.cloud</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[11px]">Token Generation Boundary</span>
              <p className="text-emerald-400 font-medium">Server-Side Verified (POST /api/meetings/[id]/token)</p>
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Payment Gateways & Webhooks</h3>
              <p className="text-xs text-slate-400">Stripe and Razorpay HMAC-SHA256 signature verification.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[11px]">Webhook Endpoint</span>
              <p className="font-mono text-slate-200">/api/payments/webhook</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[11px]">Idempotency Guard</span>
              <p className="text-emerald-400 font-medium">Active (Replay Attack Prevention)</p>
            </div>
          </div>
        </div>

        {/* PostgreSQL Row Level Security Status */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">PostgreSQL Row Level Security (RLS)</h3>
              <p className="text-xs text-slate-400">Multi-tenant isolation policies applied to 22 core tables.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Tenant Isolation Strategy</span>
              <span className="text-emerald-400 font-semibold">get_user_client_id() Filtering</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Internal Comments Segregation</span>
              <span className="text-emerald-400 font-semibold">is_internal_only = false policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
