'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Globe, Video, CreditCard, Database, ShieldCheck, Check } from 'lucide-react';

export default function AgencySettingsPage() {
  const { isAgencyAdmin } = useAuth();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div className="border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
          <span>PLATFORM CONFIG</span>
          <span>/</span>
          <span className="text-zinc-300">SECURITY & INTEGRATIONS</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Enterprise Infrastructure & Policies</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Cryptographic signing secrets, Vercel preview host whitelist, webhook replay guards, and RLS policies.
        </p>
      </div>

      <div className="space-y-4">
        {/* Vercel Host Policy Box */}
        <div className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-200">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm">Vercel Deployment Host Security Policy</h3>
              <p className="text-xs text-zinc-500">Restricts visual feedback registrations to verified domains.</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-zinc-400 font-mono text-[11px] uppercase block">Approved Host Patterns</label>
            <input
              type="text"
              readOnly
              value=".vercel.app, .nexus-clients.com, localhost"
              className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-300 font-mono"
            />
            <p className="text-[11px] text-zinc-500 font-mono">
              Registrations outside these domains are rejected with HTTP 403 by server policy.
            </p>
          </div>
        </div>

        {/* LiveKit Video Room Settings */}
        <div className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-200">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm">LiveKit WebRTC Cloud Infrastructure</h3>
              <p className="text-xs text-zinc-500">Managed WebSockets mesh for synchronized client meetings.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-md bg-[#090A0F] border border-white/[0.04] space-y-1">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block">WEBSOCKETS CLUSTER</span>
              <p className="font-mono text-zinc-200 text-xs">wss://demo.livekit.cloud</p>
            </div>
            <div className="p-3 rounded-md bg-[#090A0F] border border-white/[0.04] space-y-1">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block">TOKEN AUTHENTICATION</span>
              <p className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                <Check className="w-3 h-3" /> Server-Side Verified
              </p>
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-200">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm">Payment Gateways & Webhooks</h3>
              <p className="text-xs text-zinc-500">Stripe and Razorpay HMAC-SHA256 signature verification.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-md bg-[#090A0F] border border-white/[0.04] space-y-1">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block">WEBHOOK ENDPOINT</span>
              <p className="font-mono text-zinc-200 text-xs">/api/payments/webhook</p>
            </div>
            <div className="p-3 rounded-md bg-[#090A0F] border border-white/[0.04] space-y-1">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block">IDEMPOTENCY GUARD</span>
              <p className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                <Check className="w-3 h-3" /> Replay-Attack Proof
              </p>
            </div>
          </div>
        </div>

        {/* PostgreSQL Row Level Security Status */}
        <div className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-200">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm">PostgreSQL Row Level Security (RLS)</h3>
              <p className="text-xs text-zinc-500">Multi-tenant isolation policies applied to 22 core tables.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-[#090A0F] border border-white/[0.04] space-y-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>TENANT ISOLATION MODEL</span>
              <span className="text-emerald-400 font-semibold">get_user_client_id() Filtering</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>INTERNAL SECRETS SHIELD</span>
              <span className="text-emerald-400 font-semibold">is_internal_only = false policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
