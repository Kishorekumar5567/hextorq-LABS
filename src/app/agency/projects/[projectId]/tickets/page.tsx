'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Ticket, TicketStatus } from '@/types';
import {
  Ticket as TicketIcon,
  Plus,
  Lock,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  User,
  Tag,
  ArrowRight,
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
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New ticket state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Ticket['priority']>('medium');
  const [isClientVisible, setIsClientVisible] = useState(true);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Issue & Task Tracker</h2>
            <p className="text-xs text-slate-400 mt-1">
              Synchronized issues linked to visual review pins, bug tickets, and development sprints.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Ticket</span>
          </button>
        </div>

        {/* 2-Column Ticket List and Detail Thread */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* List Column */}
          <div className="lg:col-span-5 rounded-2xl glass-panel border border-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">All Tickets ({tickets.length})</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No tickets found.</div>
              ) : (
                tickets.map((t) => {
                  const isSelected = selectedTicketId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600/10 border-l-4 border-indigo-500'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-indigo-400 font-bold">
                          #{t.ticket_number}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {!t.is_client_visible && (
                            <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold">
                              <Lock className="w-2.5 h-2.5" /> Internal
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            t.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                            t.status === 'in_progress' ? 'bg-indigo-500/20 text-indigo-400' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-semibold text-white text-xs mt-1 line-clamp-1">{t.title}</h4>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{t.description}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
                        <span className="capitalize">{t.priority} Priority</span>
                        <span>{t.comments?.length || 0} replies</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 rounded-2xl glass-panel border border-slate-800 flex flex-col overflow-hidden">
            {selectedTicket ? (
              <div className="flex-1 flex flex-col">
                {/* Ticket Header */}
                <div className="p-6 border-b border-slate-800 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400">
                          #{selectedTicket.ticket_number}
                        </span>
                        {!selectedTicket.is_client_visible && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Agency Internal Only
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{selectedTicket.title}</h3>
                    </div>

                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value as any)}
                      className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_client">Waiting for Client</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {selectedTicket.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span>Assignee: <strong className="text-white">{selectedTicket.assignee?.full_name || 'Unassigned'}</strong></span>
                    <span>Priority: <strong className="text-white capitalize">{selectedTicket.priority}</strong></span>
                    <span>Created: <strong className="text-white">{new Date(selectedTicket.created_at).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                {/* Comment Thread */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Discussion ({selectedTicket.comments?.length || 0})
                  </h4>

                  {selectedTicket.comments?.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        c.is_internal_only
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-white">
                          {c.author?.full_name || 'Team Member'}
                        </span>
                        {c.is_internal_only && (
                          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Internal Agency
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
                <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Type reply or technical update..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-between">
                    {isAgencyStaff && (
                      <label className="flex items-center gap-2 text-xs text-amber-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isInternalComment}
                          onChange={(e) => setIsInternalComment(e.target.checked)}
                          className="rounded border-slate-700 text-amber-500 focus:ring-0"
                        />
                        <span>Internal Agency Note (Hidden from client)</span>
                      </label>
                    )}
                    <button
                      onClick={handleAddComment}
                      className="ml-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500 p-8">
                Select a ticket to view conversation history.
              </div>
            )}
          </div>
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-[#0E1524] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="font-bold text-white text-base">Create Ticket</h3>
              <form onSubmit={handleCreateTicket} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Localized currency rounding issue in cart"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Steps to reproduce, expected behavior..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isClientVisible}
                    onChange={(e) => setIsClientVisible(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Make visible in Client Portal</span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Create
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
