'use client';

import React, { useState, useRef } from 'react';
import { Project, PreviewEnvironment, VisualAnnotation } from '@/types';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Lock,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export function ReviewStudio({
  project,
  initialPreview,
  annotations: initialAnnotations,
}: {
  project: Project;
  initialPreview?: PreviewEnvironment;
  annotations: VisualAnnotation[];
}) {
  const { currentUser, isAgencyStaff } = useAuth();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isAddMode, setIsAddMode] = useState(false);
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<VisualAnnotation[]>(initialAnnotations);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');

  // New pin draft state
  const [draftPin, setDraftPin] = useState<{
    x: number;
    y: number;
    title: string;
    description: string;
    priority: VisualAnnotation['priority'];
  } | null>(null);

  // New comment draft state
  const [commentContent, setCommentContent] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  // Vercel deployment registration modal state
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [newDeployUrl, setNewDeployUrl] = useState('');
  const [newDeployBranch, setNewDeployBranch] = useState('feat/staging-preview');
  const [deployError, setDeployError] = useState('');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Viewport sizes
  const viewportWidths = {
    desktop: 'w-full max-w-[1280px]',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddMode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2));
    const y = Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2));

    setDraftPin({
      x,
      y,
      title: '',
      description: '',
      priority: 'medium',
    });
    setIsAddMode(false);
  };

  const submitDraftPin = () => {
    if (!draftPin || !draftPin.title.trim()) return;

    try {
      const newAnno = db.createAnnotation(project.id, currentUser, {
        preview_id: initialPreview?.id || 'prev-apex-01',
        page_path: '/checkout',
        viewport_width: viewport === 'desktop' ? 1440 : viewport === 'tablet' ? 768 : 375,
        viewport_height: 900,
        position_x: draftPin.x,
        position_y: draftPin.y,
        element_selector: '#interactive-preview-canvas',
        title: draftPin.title,
        description: draftPin.description,
        priority: draftPin.priority,
      });

      const updated = db.getVisualAnnotations(project.id, currentUser);
      setAnnotations(updated);
      setActivePinId(newAnno.id);
      setDraftPin(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddComment = (annotationId: string) => {
    if (!commentContent.trim()) return;

    try {
      db.addAnnotationComment(annotationId, currentUser, commentContent, isInternalComment);
      const updated = db.getVisualAnnotations(project.id, currentUser);
      setAnnotations(updated);
      setCommentContent('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConvertToTicket = (anno: VisualAnnotation) => {
    try {
      const ticket = db.createTicket(project.id, currentUser, {
        annotation_id: anno.id,
        title: `[Feedback #${anno.pin_number}] ${anno.title}`,
        description: anno.description,
        priority: anno.priority,
        is_client_visible: true,
        tags: ['visual-feedback', 'review-studio'],
      });
      alert(`Created Ticket #${ticket.ticket_number} successfully!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleResolve = (anno: VisualAnnotation) => {
    anno.status = anno.status === 'resolved' ? 'open' : 'resolved';
    anno.resolved_at = anno.status === 'resolved' ? new Date().toISOString() : undefined;
    setAnnotations([...annotations]);
  };

  const handleRegisterVercelPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeployError('');

    try {
      const res = await fetch(`/api/projects/${project.id}/previews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          deployment_id: `dpl_${Date.now()}`,
          deployment_url: newDeployUrl,
          git_branch: newDeployBranch,
          git_commit_sha: 'a1b2c3d',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Vercel preview registered successfully!');
      setShowDeployModal(false);
      window.location.reload();
    } catch (err: any) {
      setDeployError(err.message);
    }
  };

  const filteredAnnotations = annotations.filter((a) => {
    if (statusFilter === 'open') return a.status !== 'resolved';
    if (statusFilter === 'resolved') return a.status === 'resolved';
    return true;
  });

  const activeAnnotation = annotations.find((a) => a.id === activePinId);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#070A12] overflow-hidden">
      {/* Studio Toolbar */}
      <div className="border-b border-slate-800 bg-[#0B0F1C] px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewport === 'desktop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">1440px</span>
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewport === 'tablet' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline">768px</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewport === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">375px</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddMode(!isAddMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isAddMode
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 animate-pulse'
                : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAddMode ? 'Click Canvas to Pin...' : 'Add Pin Feedback'}</span>
          </button>
        </div>

        {/* Deployment Info & Actions */}
        <div className="flex items-center gap-3">
          {initialPreview ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-slate-300">{initialPreview.git_branch}</span>
              <a
                href={initialPreview.deployment_url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-1"
              >
                <span>External</span> <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <span className="text-xs text-amber-400">No current preview</span>
          )}

          {isAgencyStaff && (
            <button
              onClick={() => setShowDeployModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              Register Preview
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 bg-[#05070E] overflow-auto flex items-center justify-center p-6 relative">
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className={`${viewportWidths[viewport]} min-h-[640px] rounded-2xl border border-slate-700/80 bg-[#0E1524] shadow-2xl relative transition-all duration-300 overflow-hidden select-none ${
              isAddMode ? 'cursor-crosshair ring-2 ring-indigo-500/50' : 'cursor-default'
            }`}
          >
            {/* Mock website header bar */}
            <div className="border-b border-slate-800/80 bg-[#121A2C] px-4 py-3 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <span className="ml-2 font-mono text-slate-300">
                  {initialPreview ? initialPreview.deployment_url : 'https://apex-preview.vercel.app/checkout'}
                </span>
              </div>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-indigo-400 font-mono">
                SDK Connected
              </span>
            </div>

            {/* Simulated Live Staging Page for Apex Checkout */}
            <div className="p-8 space-y-6 text-slate-100">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    Apex Global Store · Express Checkout
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Review & Complete Order
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase">Cart Items (2)</h3>
                    <div className="flex justify-between text-sm">
                      <span>Pro Wireless Earbuds Gen 2</span>
                      <span className="font-semibold text-white">$189.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Leather Travel Case (Midnight)</span>
                      <span className="font-semibold text-white">$45.00</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase">Payment Summary</h3>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Subtotal</span>
                      <span>$234.00</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Estimated Regional VAT (20%)</span>
                      <span>$46.80</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white">
                      <span>Total Due</span>
                      <span className="text-emerald-400">$280.80 USD</span>
                    </div>
                  </div>
                </div>

                {/* The checkout submit button that was annotated */}
                <div id="btn-submit-payment" className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <button className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Payment & Confirm Order</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    256-bit encrypted checkout via Stripe & Nexus Cloud.
                  </p>
                </div>
              </div>
            </div>

            {/* Pinned Feedback Indicators on Canvas */}
            {annotations.map((anno) => {
              const isResolved = anno.status === 'resolved';
              const isSelected = activePinId === anno.id;
              return (
                <div
                  key={anno.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePinId(anno.id);
                  }}
                  style={{
                    left: `${anno.position_x}%`,
                    top: `${anno.position_y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-all transform ${
                    isSelected ? 'scale-125' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-xl border-2 transition-all ${
                      isResolved
                        ? 'bg-slate-700 text-slate-300 border-slate-500'
                        : isSelected
                        ? 'bg-indigo-600 text-white border-white shadow-indigo-600/50 ring-4 ring-indigo-400/30'
                        : 'bg-indigo-500 text-white border-indigo-200 shadow-indigo-500/40'
                    }`}
                  >
                    {anno.pin_number}
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block z-30 w-48 p-2 rounded-lg bg-slate-900/95 border border-slate-700 text-slate-200 text-xs shadow-xl pointer-events-none">
                    <p className="font-semibold text-white line-clamp-1">{anno.title}</p>
                    <p className="text-[10px] text-slate-400">{anno.priority.toUpperCase()} · {anno.status}</p>
                  </div>
                </div>
              );
            })}

            {/* Draft Pin Drop Marker */}
            {draftPin && (
              <div
                style={{ left: `${draftPin.x}%`, top: `${draftPin.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
              >
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs border-2 border-white animate-bounce shadow-xl">
                  +
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Details & Comment Sidebar */}
        <div className="w-96 border-l border-slate-800 bg-[#0B0F1C] flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Visual Annotations ({annotations.length})</h3>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-0.5 rounded ${statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-2 py-0.5 rounded ${statusFilter === 'open' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-2 py-0.5 rounded ${statusFilter === 'resolved' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Draft Pin Form Modal / Drawer */}
          {draftPin && (
            <div className="p-4 bg-slate-900/90 border-b border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">New Pin Feedback</span>
                <button onClick={() => setDraftPin(null)} className="text-xs text-slate-500 hover:text-white">
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="Feedback summary..."
                value={draftPin.title}
                onChange={(e) => setDraftPin({ ...draftPin, title: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
              <textarea
                rows={3}
                placeholder="Detailed notes or suggested change..."
                value={draftPin.description}
                onChange={(e) => setDraftPin({ ...draftPin, description: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-between">
                <select
                  value={draftPin.priority}
                  onChange={(e) => setDraftPin({ ...draftPin, priority: e.target.value as any })}
                  className="text-xs bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-300"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button
                  onClick={submitDraftPin}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Post Pin
                </button>
              </div>
            </div>
          )}

          {/* Active Pin Detailed Thread View */}
          {activeAnnotation ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActivePinId(null)}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    ← Back to list
                  </button>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    activeAnnotation.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {activeAnnotation.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-white text-sm">
                    #{activeAnnotation.pin_number}: {activeAnnotation.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {activeAnnotation.description}
                  </p>
                </div>

                {/* Actions: Convert to ticket & Resolve */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleToggleResolve(activeAnnotation)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeAnnotation.status === 'resolved' ? 'Reopen' : 'Resolve'}</span>
                  </button>
                  <button
                    onClick={() => handleConvertToTicket(activeAnnotation)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-xs text-indigo-300 border border-indigo-500/30 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Convert to Ticket</span>
                  </button>
                </div>
              </div>

              {/* Comments Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeAnnotation.comments?.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border text-xs ${
                      c.is_internal_only
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <span className="font-semibold text-slate-200">
                        {c.author?.full_name || 'Team Member'}
                      </span>
                      {c.is_internal_only && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                          <Lock className="w-2.5 h-2.5" /> Internal
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2">
                <textarea
                  rows={2}
                  placeholder="Reply to thread..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center justify-between">
                  {isAgencyStaff && (
                    <label className="flex items-center gap-1.5 text-xs text-amber-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span className="text-[11px]">Internal Only</span>
                    </label>
                  )}
                  <button
                    onClick={() => handleAddComment(activeAnnotation.id)}
                    className="ml-auto px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Annotations List */
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
              {filteredAnnotations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No visual feedback pins found. Click "Add Pin Feedback" to drop a pin on the canvas.
                </div>
              ) : (
                filteredAnnotations.map((anno) => (
                  <div
                    key={anno.id}
                    onClick={() => setActivePinId(anno.id)}
                    className="p-4 hover:bg-slate-900/60 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                        {anno.pin_number}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        anno.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {anno.status}
                      </span>
                    </div>
                    <h5 className="font-medium text-slate-200 text-xs line-clamp-1">{anno.title}</h5>
                    <p className="text-slate-400 text-xs line-clamp-2">{anno.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{anno.author?.full_name || 'Client'}</span>
                      <span>{anno.comments?.length || 0} replies</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Register Vercel Preview Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0E1524] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Register Vercel Deployment</h3>
            <p className="text-xs text-slate-400">
              Securely register an approved staging deployment for client review. Must conform to approved Vercel host policies.
            </p>

            {deployError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {deployError}
              </div>
            )}

            <form onSubmit={handleRegisterVercelPreview} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Deployment URL (HTTPS)</label>
                <input
                  type="url"
                  required
                  placeholder="https://apex-preview.vercel.app"
                  value={newDeployUrl}
                  onChange={(e) => setNewDeployUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Git Branch</label>
                <input
                  type="text"
                  required
                  value={newDeployBranch}
                  onChange={(e) => setNewDeployBranch(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Verify & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
