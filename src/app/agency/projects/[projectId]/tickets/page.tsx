'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Ticket, TicketStatus } from '@/types';
import {
  Plus,
  Lock,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  X,
  Filter,
} from 'lucide-react';

export default function AgencyTicketsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { currentUser, isAgencyStaff } = useAuth();

  let project;
  try {
    project = db.getProject(projectId, currentUser);
  } catch (err: any) {
    return <div className="p-8 text-center text-rose-400">{err.message}</div>;
  }

  const [tickets, setTickets] = useState<Ticket[]>(() => db.getTickets(projectId, currentUser));
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New ticket state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Ticket['priority']>('medium');
  const [isClientVisible, setIsClientVisible] = useState(true);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase()) ||
                          t.ticket_number.toString().includes(search);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || filteredTickets[0];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = db.createTicket(projectId, currentUser, {
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        is_client_visible: isClientVisible,
        assignee_id: currentUser.id,
        tags: ['development'],
      });

      const updated = db.getTickets(projectId, currentUser);
      setTickets(updated);
      setSelectedTicketId(created.id);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (!selectedTicket) return;
    selectedTicket.status = status;
    selectedTicket.updated_at = new Date().toISOString();
    setTickets([...tickets]);
  };

  const handleAddComment = () => {
    if (!selectedTicket || !commentText.trim()) return;

    if (!selectedTicket.comments) selectedTicket.comments = [];
    selectedTicket.comments.push({
      id: `tc-${Date.now()}`,
      ticket_id: selectedTicket.id,
      author_id: currentUser.id,
      content: commentText,
      is_internal_only: isInternalComment,
      created_at: new Date().toISOString(),
      author: currentUser,
    });

    setTickets([...tickets]);
    setCommentText('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/agency/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 flex-1 flex flex-col">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
              <span>PROJECT ISSUES</span>
              <span>/</span>
              <span className="text-zinc-300">LINEAR WORKFLOW</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Issue & Feedback Tickets</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Visual review pins, client revision requests, and internal engineering tasks.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </button>
        </div>

        {/* 2-Column Linear View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
          {/* Left Column: Tickets List */}
          <div className="lg:col-span-5 rounded-lg bg-[#0E1017] border border-white/[0.07] flex flex-col overflow-hidden">
            {/* Search and Filters */}
            <div className="p-3 border-b border-white/[0.06] space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter issues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md bg-[#090A0F] border border-white/[0.07] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                {['all', 'open', 'in_progress', 'resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-0.5 rounded font-mono uppercase tracking-wide transition-all ${
                      statusFilter === st
                        ? 'bg-white/[0.1] text-zinc-100 border border-white/[0.12]'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 font-mono">No matching tickets found.</div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#141722] border-l-2 border-zinc-200'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-zinc-400 font-medium">
                          NEX-{t.ticket_number}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {!t.is_client_visible && (
                            <span className="flex items-center gap-1 text-[9px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded">
                              <Lock className="w-2.5 h-2.5" /> Internal
                            </span>
                          )}
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wide border ${
                            t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            t.status === 'in_progress' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' :
                            'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-medium text-zinc-100 text-xs mt-1.5 line-clamp-1">{t.title}</h4>
                      <p className="text-zinc-500 text-[11px] mt-1 line-clamp-1">{t.description}</p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2">
                        <span className="capitalize">{t.priority} Priority</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {t.comments?.length || 0}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Ticket Inspector */}
          <div className="lg:col-span-7 rounded-lg bg-[#0E1017] border border-white/[0.07] flex flex-col overflow-hidden">
            {selectedTicket ? (
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-white/[0.06] space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-400 font-semibold">
                          NEX-{selectedTicket.ticket_number}
                        </span>
                        {!selectedTicket.is_client_visible && (
                          <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Agency Internal Only
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-zinc-100 mt-1">{selectedTicket.title}</h3>
                    </div>

                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value as any)}
                      className="text-xs bg-[#090A0F] border border-white/[0.08] text-zinc-200 rounded-md px-2.5 py-1 focus:outline-none focus:border-zinc-500 font-mono"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_client">Waiting for Client</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="text-xs text-zinc-300 leading-relaxed bg-[#090A0F] p-3.5 rounded-md border border-white/[0.05]">
                    {selectedTicket.description}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 font-mono pt-1">
                    <span>Assignee: <strong className="text-zinc-200">{selectedTicket.assignee?.full_name || 'Unassigned'}</strong></span>
                    <span>Priority: <strong className="text-zinc-200 capitalize">{selectedTicket.priority}</strong></span>
                    <span>Created: <strong className="text-zinc-200">{new Date(selectedTicket.created_at).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                {/* Discussion Thread */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  <div className="flex items-center justify-between text-zinc-500 text-xs font-mono mb-2">
                    <span>THREAD ACTIVITY</span>
                    <span>{selectedTicket.comments?.length || 0} MESSAGES</span>
                  </div>

                  {selectedTicket.comments?.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-md text-xs space-y-1.5 ${
                        c.is_internal_only
                          ? 'bg-amber-500/[0.06] border border-amber-500/20'
                          : 'bg-[#090A0F] border border-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-200">
                            {c.author?.full_name || 'Team Member'}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono">
                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {c.is_internal_only && (
                          <span className="text-[10px] font-mono uppercase text-amber-400 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Internal Agency
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="p-4 border-t border-white/[0.06] bg-[#0A0C11] space-y-3">
                  <textarea
                    rows={2}
                    placeholder="Type technical update or response..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                  <div className="flex items-center justify-between">
                    {isAgencyStaff && (
                      <label className="flex items-center gap-2 text-xs text-amber-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isInternalComment}
                          onChange={(e) => setIsInternalComment(e.target.checked)}
                          className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
                        />
                        <span className="text-[11px] font-mono">Internal Note (Hidden from client)</span>
                      </label>
                    )}
                    <button
                      onClick={handleAddComment}
                      className="ml-auto btn-primary"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post Update</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-500 font-mono p-8">
                Select an issue from the list to view its activity thread.
              </div>
            )}
          </div>
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-[#0E1017] border border-white/[0.1] rounded-lg p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="font-semibold text-zinc-100 text-sm">Create Issue Ticket</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Issue Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Localized currency rounding in checkout flow"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Description / Reproduction</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Steps to reproduce, expected behavior, context..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs text-zinc-300 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isClientVisible}
                    onChange={(e) => setIsClientVisible(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-zinc-200 focus:ring-0"
                  />
                  <span>Visible in Client Workspace</span>
                </label>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
