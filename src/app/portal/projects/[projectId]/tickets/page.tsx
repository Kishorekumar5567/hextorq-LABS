'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Ticket } from '@/types';
import { Ticket as TicketIcon, Plus, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function ClientTicketsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { currentUser } = useAuth();

  let project;
  try {
    project = db.getProject(projectId, currentUser);
  } catch (err: any) {
    return <div className="p-8 text-center text-rose-400">{err.message}</div>;
  }

  const [tickets, setTickets] = useState<Ticket[]>(() => db.getTickets(projectId, currentUser));
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Ticket['priority']>('medium');
  const [replyText, setReplyText] = useState('');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = db.createTicket(projectId, currentUser, {
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        is_client_visible: true,
        tags: ['client-reported'],
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

  const handleReply = () => {
    if (!selectedTicket || !replyText.trim()) return;

    if (!selectedTicket.comments) selectedTicket.comments = [];
    selectedTicket.comments.push({
      id: `tc-${Date.now()}`,
      ticket_id: selectedTicket.id,
      author_id: currentUser.id,
      content: replyText,
      is_internal_only: false,
      created_at: new Date().toISOString(),
      author: currentUser,
    });

    setTickets([...tickets]);
    setReplyText('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/portal/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Client Issue Tracker</h2>
            <p className="text-xs text-slate-400 mt-1">
              Submit change requests, track bug fixes, and collaborate with your engineering team.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Issue</span>
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          <div className="lg:col-span-5 rounded-2xl glass-panel border border-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Open Tickets ({tickets.length})</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No issues reported.</div>
              ) : (
                tickets.map((t) => {
                  const isSelected = selectedTicketId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-600/10 border-l-4 border-purple-500'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-purple-400 font-bold">
                          #{t.ticket_number}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          t.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                          t.status === 'in_progress' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-semibold text-white text-xs mt-1 line-clamp-1">{t.title}</h4>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{t.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
                        <span className="capitalize">{t.priority} Priority</span>
                        <span>{t.comments?.length || 0} messages</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl glass-panel border border-slate-800 flex flex-col overflow-hidden">
            {selectedTicket ? (
              <div className="flex-1 flex flex-col">
                <div className="p-6 border-b border-slate-800 space-y-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-purple-400">
                      #{selectedTicket.ticket_number}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedTicket.title}</h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {selectedTicket.comments?.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-white">{c.author?.full_name || 'Team'}</span>
                        <span className="text-[10px]">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-300">{c.content}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Reply to the development team..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleReply}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow"
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500 p-8">
                Select an issue to view communication.
              </div>
            )}
          </div>
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-[#0E1524] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="font-bold text-white text-base">Submit Issue / Change Request</h3>
              <form onSubmit={handleCreateTicket} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Issue Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mobile checkout tax dropdown doesn't expand"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe what you observed and your desired change..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

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
                    className="px-4 py-2 rounded-lg bg-purple-600 text-xs font-semibold text-white hover:bg-purple-500"
                  >
                    Submit Issue
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
