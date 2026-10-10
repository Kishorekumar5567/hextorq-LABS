'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Sparkles,
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
} from 'lucide-react';

export default function HomePage() {
  const { availableUsers, switchUser, currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#070A14] text-slate-100 cinematic-mesh selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0A0E1A]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none">NEXUS</h1>
            <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">Client Collaboration SaaS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/agency/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-semibold border border-slate-700 transition-all hidden sm:inline-block"
          >
            Agency HQ
          </Link>
          <Link
            href="/portal/dashboard"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            Client Portal →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center space-y-12">
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold animate-pulse-glow">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Tenant Architecture · PostgreSQL RLS · LiveKit Video · Stripe Escrow</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            One Secure Workspace for Modern Agencies & Clients
          </h1>

          <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Review live staging previews, drop visual feedback pins, convert reviews into tracked tickets, execute milestone digital sign-offs, and settle invoices with cryptographic assurance.
          </p>
        </div>

        {/* Live Persona Switcher Showcase */}
        <div className="max-w-3xl mx-auto p-6 rounded-3xl glass-panel-elevated border border-indigo-500/20 space-y-4 text-left shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Select Persona to Test Real-Time Isolation
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Zero Mocks · Live DB Store</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {availableUsers.map((user) => {
              const isSelected = currentUser.id === user.id;
              const isAgency = user.role === 'agency_admin' || user.role === 'agency_developer';
              const targetUrl = isAgency ? '/agency/dashboard' : '/portal/dashboard';

              return (
                <div
                  key={user.id}
                  onClick={() => switchUser(user.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700"
                      />
                      <div>
                        <h3 className="font-bold text-white text-sm">{user.full_name}</h3>
                        <p className="text-[11px] text-slate-400">{user.company_title}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      user.role === 'agency_admin' ? 'bg-amber-500/20 text-amber-300' :
                      user.role === 'agency_developer' ? 'bg-cyan-500/20 text-cyan-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {user.role === 'agency_admin' ? 'Admin' : user.role === 'agency_developer' ? 'Dev' : 'Client'}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {isAgency ? 'Full Agency Permissions' : 'Tenant Sandboxed'}
                    </span>
                    <Link
                      href={targetUrl}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 text-[11px]"
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

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Live Visual Review Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drop numbered feedback pins with exact coordinates on live Vercel deployments. Convert pinned feedback directly into dev tickets with one click.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">PostgreSQL RLS Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict multi-tenant segregation. Clients can never inspect other clients' projects, internal developer discussions, or private pricing margins.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Milestone Escrow & Sign-Offs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Execute cryptographic digital sign-offs on deliverables, trigger celebratory confetti, and process Stripe/Razorpay payments with webhook idempotency.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0A0E1A] py-8 text-center text-xs text-slate-500">
        <p>Nexus Client Collaboration Platform · Built with Next.js App Router, Tailwind CSS & Supabase PostgreSQL</p>
      </footer>
    </div>
  );
}
