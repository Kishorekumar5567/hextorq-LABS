'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Shield, User, Users, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RoleSwitcherBar() {
  const { currentUser, availableUsers, switchUser, isAgencyStaff, isClient } = useAuth();

  return (
    <div className="bg-[#0B101E] border-b border-indigo-500/20 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm z-50">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
          <Shield className="w-3.5 h-3.5" />
          <span>Interactive Persona Sandbox</span>
        </div>
        <span className="text-slate-400 hidden sm:inline">
          Test multi-tenant RLS isolation in real-time:
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-0.5">
        {availableUsers.map((u) => {
          const isActive = u.id === currentUser.id;
          return (
            <button
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50'
              }`}
            >
              {isActive && <CheckCircle className="w-3 h-3 text-emerald-300" />}
              <span>{u.full_name}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded ${
                u.role === 'agency_admin' ? 'bg-amber-500/20 text-amber-300' :
                u.role === 'agency_developer' ? 'bg-cyan-500/20 text-cyan-300' :
                'bg-purple-500/20 text-purple-300'
              }`}>
                {u.role === 'agency_admin' ? 'Admin' : u.role === 'agency_developer' ? 'Dev' : 'Client'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {isAgencyStaff ? (
          <Link
            href="/agency/dashboard"
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <span>Agency Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <Link
            href="/portal/dashboard"
            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            <span>Client Portal</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
