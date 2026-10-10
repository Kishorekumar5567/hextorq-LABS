'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Ticket } from '@/types';
import { Plus, MessageSquare, Send, X, Search } from 'lucide-react';

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
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Ticket['priority']>('medium');
  const [replyText, setReplyText] = useState('');

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.ticket_number.toString().includes(search)
  );

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || filteredTickets[0];

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
              <span>SUPPORT</span>
              <span>/</span>
              <span className="text-zinc-300">CHANGE REQUESTS</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Issues & Revision Requests</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Submit change requests, track engineering responses, and review status updates.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Request</span>
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[540px]">
          {/* List Column */}
          <div className="lg:col-span-5 rounded-lg bg-[#0E1017] border border-white/[0.07] flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/[0.06]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md bg-[#090A0F] border border-white/[0.07] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 font-mono">No requests logged.</div>
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
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wide border ${
                          t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          t.status === 'in_progress' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' :
                          'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
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

          {/* Details Column */}
          <div className="lg:col-span-7 rounded-lg bg-[#0E1017] border border-white/[0.07] flex flex-col overflow-hidden">
            {selectedTicket ? (
              <div className="flex-1 flex flex-col">
                <div className="p-5 border-b border-white/[0.06] space-y-3">
                  <div>
                    <span className="font-mono text-xs text-zinc-400 font-medium">
                      NEX-{selectedTicket.ticket_number}
                    </span>
                    <h3 className="text-base font-semibold text-zinc-100 mt-1">{selectedTicket.title}</h3>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed bg-[#090A0F] p-3 rounded-md border border-white/[0.05]">
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  <div className="text-xs font-mono text-zinc-500 mb-2">COMMUNICATION THREAD</div>
                  {selectedTicket.comments?.map((c) => (
                    <div key={c.id} className="p-3 rounded-md border border-white/[0.05] bg-[#090A0F] text-xs space-y-1">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="font-medium text-zinc-200">{c.author?.full_name || 'Team'}</span>
                        <span className="text-[10px] text-zinc-600 font-mono">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-white/[0.06] bg-[#0A0C11] space-y-2.5">
                  <textarea
                    rows={2}
                    placeholder="Reply to the engineering team..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleReply}
                      className="btn-primary"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-500 font-mono p-8">
                Select an issue to view communication history.
              </div>
            )}
          </div>
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-[#0E1017] border border-white/[0.1] rounded-lg p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="font-semibold text-zinc-100 text-sm">Submit Change Request</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Subject / Issue Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mobile checkout tax dropdown doesn't expand"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe what you observed and your desired change..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Priority</label>
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
