'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Shield,
  Eye,
  CheckCircle2,
  Video,
  CreditCard,
  ArrowRight,
  Layers,
  Lock,
  Building,
  Terminal,
  ExternalLink,
  Code2,
  GitBranch,
  Monitor,
} from 'lucide-react';

import { HextorqLogo } from '@/components/common/HextorqLogo';

export default function HomePage() {
  const { availableUsers, switchUser, currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#08090D] text-zinc-100 flex flex-col justify-between selection:bg-zinc-700 selection:text-white">
      {/* Precision Top Navbar */}
      <header className="border-b border-white/[0.07] bg-[#0A0B10]/90 backdrop-blur-md px-6 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <HextorqLogo size="md" showWordmark={true} />
            <span className="text-[10px] font-mono uppercase bg-white/[0.06] text-zinc-400 px-1.5 py-0.5 rounded border border-white/[0.05]">
              v1.0-prod
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/agency/dashboard"
              className="text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:inline-block font-medium"
            >
              Agency HQ
            </Link>
            <Link
              href="/portal/dashboard"
              className="text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:inline-block font-medium"
            >
              Client Portal
            </Link>
            <Link
              href="/agency/projects/proj-apex-001/feedback"
              className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-all shadow-xs"
            >
              Open Studio →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-16">
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>PRODUCTION CLIENT COLLABORATION ENGINE</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-100 leading-[1.1]">
            The standard for modern engineering studios & clients.
          </h1>

          <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            One unified, cryptographically segregated platform. Review live staging builds with pixel-accurate visual pins, discuss requirements, conduct video syncs, and settle milestone escrow invoices.
          </p>
        </div>

        {/* Live Interactive Persona Switcher (Engineering Control Center) */}
        <div className="p-6 rounded-2xl ui-surface border border-white/[0.08] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-zinc-400" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Multi-Tenant Persona Sandbox
              </h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">Live PostgreSQL RLS Isolation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableUsers.map((user) => {
              const isSelected = currentUser.id === user.id;
              const isAgency = user.role === 'agency_admin' || user.role === 'agency_developer';
              const targetUrl = isAgency ? '/agency/dashboard' : '/portal/dashboard';

              return (
                <div
                  key={user.id}
                  onClick={() => switchUser(user.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white/[0.07] border-white/25 shadow-xs'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                      />
                      <div>
                        <h3 className="font-semibold text-zinc-100 text-xs">{user.full_name}</h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{user.company_title}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/[0.06]">
                      {user.role === 'agency_admin' ? 'Admin' : user.role === 'agency_developer' ? 'Dev' : 'Client'}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-xs">
                    <span className="text-zinc-500 text-[11px] font-mono">
                      {isAgency ? 'Full Agency Scope' : 'Tenant Isolated'}
                    </span>
                    <Link
                      href={targetUrl}
                      className="text-zinc-300 hover:text-white font-medium flex items-center gap-1 text-[11px]"
                    >
                      <span>Enter Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Studio Product Feature Matrix (Clean Bento Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl ui-surface border border-white/[0.07] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-200">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Visual Review Studio</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Drop numbered feedback pins with exact coordinates on live Vercel deployments. Convert pinned feedback directly into dev tickets with one click.
            </p>
          </div>

          <div className="p-6 rounded-2xl ui-surface border border-white/[0.07] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-200">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">PostgreSQL RLS Isolation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Strict multi-tenant segregation. Clients can never inspect other clients' projects, internal developer discussions, or private pricing margins.
            </p>
          </div>

          <div className="p-6 rounded-2xl ui-surface border border-white/[0.07] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-200">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Milestone Escrow & Sign-Offs</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Execute cryptographic digital sign-offs on deliverables, trigger celebratory confetti, and process Stripe/Razorpay payments with webhook idempotency.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] bg-[#0A0B10] py-8 text-center text-xs text-zinc-500 font-mono">
        <div className="flex flex-col items-center justify-center gap-2">
          <HextorqLogo size="sm" showWordmark={true} />
          <p className="text-[11px] text-zinc-500">Engineering Studio & Dedicated Client Workspace</p>
        </div>
      </footer>
    </div>
  );
}
