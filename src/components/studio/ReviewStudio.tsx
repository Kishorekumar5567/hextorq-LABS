'use client';

import React, { useState, useRef } from 'react';
import { Project, PreviewEnvironment, VisualAnnotation } from '@/types';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import {
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Check,
  Lock,
  ExternalLink,
  GitBranch,
  ShieldCheck,
  Ticket,
  SlidersHorizontal,
  ChevronRight,
  MessageSquare,
  CornerDownLeft,
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
  const viewportStyles = {
    desktop: 'w-full max-w-[1240px]',
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
    <div className="flex flex-col h-[calc(100vh-125px)] bg-[#07080C] overflow-hidden select-none">
      {/* Studio Precision Toolbar */}
      <div className="border-b border-white/[0.07] bg-[#0A0B10] px-4 py-2 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* Viewport Segmented Control */}
          <div className="flex items-center gap-0.5 bg-[#12141C] border border-white/[0.07] p-0.5 rounded-lg">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewport === 'desktop' ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1440px</span>
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewport === 'tablet' ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">768px</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewport === 'mobile' ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">375px</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddMode(!isAddMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              isAddMode
                ? 'bg-amber-400 text-zinc-950 font-bold border-amber-300 shadow-xs'
                : 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] border-white/[0.08]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddMode ? 'Click Canvas to Pin...' : 'Drop Pin Feedback'}</span>
          </button>
        </div>

        {/* Deployment Header */}
        <div className="flex items-center gap-3">
          {initialPreview ? (
            <div className="flex items-center gap-2 text-xs bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06] text-zinc-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{initialPreview.git_branch}</span>
              <a
                href={initialPreview.deployment_url}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 hover:text-white flex items-center gap-1 ml-1"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <span className="text-xs text-amber-400 font-mono">No preview</span>
          )}

          {isAgencyStaff && (
            <button
              onClick={() => setShowDeployModal(true)}
              className="px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium border border-white/[0.08] transition-colors"
            >
              Deploy Preview
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 bg-[#050608] overflow-auto flex items-center justify-center p-6 relative">
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className={`${viewportStyles[viewport]} min-h-[640px] rounded-xl border border-white/[0.08] bg-[#0E1017] shadow-2xl relative transition-all duration-200 overflow-hidden ${
              isAddMode ? 'cursor-crosshair ring-1 ring-amber-400/50' : 'cursor-default'
            }`}
          >
            {/* Minimalist Browser Frame Bar */}
            <div className="border-b border-white/[0.07] bg-[#12141D] px-3.5 py-2 flex items-center justify-between text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <div className="bg-[#090A0E] px-3 py-1 rounded text-[11px] text-zinc-300 border border-white/[0.05] ml-2 flex items-center gap-1.5">
                  <Lock className="w-2.5 h-2.5 text-zinc-500" />
                  <span>{initialPreview ? initialPreview.deployment_url : 'https://apex-preview.vercel.app/checkout'}</span>
                </div>
              </div>
              <span className="text-[10px] text-zinc-500">STAGING PREVIEW</span>
            </div>

            {/* Rendered Staging Webpage (Apex Checkout 2.0) */}
            <div className="p-8 space-y-6 text-zinc-100 max-w-2xl mx-auto">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Apex Global · Checkout v2.4
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Payment Authorization & Review
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.06] space-y-2">
                  <span className="font-semibold text-zinc-300 uppercase tracking-wide text-[10px]">Order Summary</span>
                  <div className="flex justify-between text-zinc-300">
                    <span>Pro Wireless Earbuds</span>
                    <span className="font-semibold text-white">$189.00</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Travel Case Midnight</span>
                    <span className="font-semibold text-white">$45.00</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.06] space-y-2">
                  <span className="font-semibold text-zinc-300 uppercase tracking-wide text-[10px]">Taxes & Total</span>
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>$234.00</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Estimated VAT (20%)</span>
                    <span>$46.80</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-1.5 flex justify-between font-bold text-white">
                    <span>Total Due</span>
                    <span>$280.80 USD</span>
                  </div>
                </div>
              </div>

              {/* The element annotated with pin #1 */}
              <div id="interactive-preview-canvas" className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.06]">
                <button className="w-full py-3 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Payment & Confirm Order</span>
                </button>
                <p className="text-[11px] text-center text-zinc-500 mt-2 font-mono">
                  Encrypted checkout via Stripe & Nexus Cloud.
                </p>
              </div>
            </div>

            {/* Visual Feedback Pins Placed on Canvas */}
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
                    isSelected ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shadow-lg border transition-all ${
                      isResolved
                        ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        : isSelected
                        ? 'bg-zinc-100 text-zinc-950 border-white ring-4 ring-white/15'
                        : 'bg-zinc-900 text-white border-white/20'
                    }`}
                  >
                    {anno.pin_number}
                  </div>

                  {/* Micro Tooltip on Hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block z-30 w-48 p-2 rounded-lg bg-[#0E1017] border border-white/[0.1] text-zinc-200 text-xs shadow-xl pointer-events-none">
                    <p className="font-semibold text-zinc-100 truncate">{anno.title}</p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5 uppercase">{anno.priority} · {anno.status}</p>
                  </div>
                </div>
              );
            })}

            {/* Draft Marker */}
            {draftPin && (
              <div
                style={{ left: `${draftPin.x}%`, top: `${draftPin.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
              >
                <div className="w-7 h-7 rounded-full bg-amber-400 text-zinc-950 font-bold flex items-center justify-center text-xs border border-white animate-pulse shadow-lg font-mono">
                  +
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Inspector & Discussion Sidebar */}
        <div className="w-88 border-l border-white/[0.07] bg-[#0A0B10] flex flex-col shrink-0">
          <div className="p-3 border-b border-white/[0.07] flex items-center justify-between">
            <span className="font-semibold text-zinc-100 text-xs">Review Pins ({annotations.length})</span>
            <div className="flex items-center gap-1 text-[11px] bg-white/[0.04] p-0.5 rounded-md border border-white/[0.06]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-0.5 rounded ${statusFilter === 'all' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-2 py-0.5 rounded ${statusFilter === 'open' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400'}`}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-2 py-0.5 rounded ${statusFilter === 'resolved' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400'}`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* New Pin Form */}
          {draftPin && (
            <div className="p-4 bg-[#12141E] border-b border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">New Feedback Pin</span>
                <button onClick={() => setDraftPin(null)} className="text-xs text-zinc-500 hover:text-white">
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="Issue summary..."
                value={draftPin.title}
                onChange={(e) => setDraftPin({ ...draftPin, title: e.target.value })}
                className="w-full text-xs p-2 rounded-md bg-[#090A0E] border border-white/[0.08] text-white focus:outline-none focus:border-zinc-400"
              />
              <textarea
                rows={2}
                placeholder="Notes or recommendation..."
                value={draftPin.description}
                onChange={(e) => setDraftPin({ ...draftPin, description: e.target.value })}
                className="w-full text-xs p-2 rounded-md bg-[#090A0E] border border-white/[0.08] text-white focus:outline-none focus:border-zinc-400"
              />
              <div className="flex items-center justify-between pt-1">
                <select
                  value={draftPin.priority}
                  onChange={(e) => setDraftPin({ ...draftPin, priority: e.target.value as any })}
                  className="text-xs bg-[#090A0E] border border-white/[0.08] rounded-md p-1.5 text-zinc-300"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button
                  onClick={submitDraftPin}
                  className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold"
                >
                  Post Pin
                </button>
              </div>
            </div>
          )}

          {/* Active Pin Detail Thread */}
          {activeAnnotation ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/[0.07] space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActivePinId(null)}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono"
                  >
                    ← All issues
                  </button>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    activeAnnotation.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/[0.06] text-zinc-300'
                  }`}>
                    {activeAnnotation.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-zinc-100 text-xs">
                    Pin #{activeAnnotation.pin_number}: {activeAnnotation.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {activeAnnotation.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleToggleResolve(activeAnnotation)}
                    className="px-2.5 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.09] text-xs text-zinc-200 font-medium flex items-center gap-1.5 border border-white/[0.08] transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeAnnotation.status === 'resolved' ? 'Reopen' : 'Resolve'}</span>
                  </button>
                  <button
                    onClick={() => handleConvertToTicket(activeAnnotation)}
                    className="px-2.5 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.09] text-xs text-zinc-200 border border-white/[0.08] font-medium flex items-center gap-1.5 transition-colors"
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
                    className={`p-3 rounded-lg border text-xs ${
                      c.is_internal_only
                        ? 'bg-amber-500/[0.04] border-amber-500/20'
                        : 'bg-white/[0.02] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                      <span className="font-semibold text-zinc-200">
                        {c.author?.full_name || 'Team Member'}
                      </span>
                      {c.is_internal_only && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                          <Lock className="w-2.5 h-2.5" /> Internal
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="p-3 border-t border-white/[0.07] bg-[#07080C] space-y-2">
                <textarea
                  rows={2}
                  placeholder="Reply to feedback thread..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full text-xs p-2 rounded-md bg-[#12141D] border border-white/[0.08] text-white focus:outline-none focus:border-zinc-400"
                />
                <div className="flex items-center justify-between">
                  {isAgencyStaff && (
                    <label className="flex items-center gap-1.5 text-xs text-amber-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-0"
                      />
                      <span className="text-[11px] font-mono">Internal Only</span>
                    </label>
                  )}
                  <button
                    onClick={() => handleAddComment(activeAnnotation.id)}
                    className="ml-auto px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Annotations List */
            <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05]">
              {filteredAnnotations.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 font-mono">
                  No visual feedback pins found. Click "Drop Pin Feedback" above.
                </div>
              ) : (
                filteredAnnotations.map((anno) => (
                  <div
                    key={anno.id}
                    onClick={() => setActivePinId(anno.id)}
                    className="p-3.5 hover:bg-white/[0.03] cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-200 border border-white/10 text-[11px] font-mono font-bold flex items-center justify-center">
                        {anno.pin_number}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                        anno.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.05] text-zinc-400'
                      }`}>
                        {anno.status}
                      </span>
                    </div>
                    <h5 className="font-medium text-zinc-200 text-xs truncate">{anno.title}</h5>
                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{anno.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0E1017] border border-white/[0.1] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm">Register Vercel Deployment</h3>
            <p className="text-xs text-zinc-400">
              Register an approved staging build for client review. Submissions must match allowed host policies.
            </p>

            {deployError && (
              <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {deployError}
              </div>
            )}

            <form onSubmit={handleRegisterVercelPreview} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 block mb-1">Deployment URL (HTTPS)</label>
                <input
                  type="url"
                  required
                  placeholder="https://apex-preview.vercel.app"
                  value={newDeployUrl}
                  onChange={(e) => setNewDeployUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-md bg-[#08090C] border border-white/[0.1] text-white focus:outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 block mb-1">Git Branch</label>
                <input
                  type="text"
                  required
                  value={newDeployBranch}
                  onChange={(e) => setNewDeployBranch(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-md bg-[#08090C] border border-white/[0.1] text-white focus:outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-3.5 py-1.5 rounded-md bg-white/[0.06] text-xs text-zinc-300 hover:bg-white/[0.1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-white"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
