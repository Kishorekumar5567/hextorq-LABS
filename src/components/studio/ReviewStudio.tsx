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
  Ticket,
  RotateCw,
  Sparkles,
  Layers,
  MousePointer,
  HelpCircle,
  Trash2,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
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
  const [isMaximized, setIsMaximized] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<VisualAnnotation[]>(initialAnnotations);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [iframeScrollY, setIframeScrollY] = useState(0);
  const [isFrameReady, setIsFrameReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsIframeLoading(false), 800);
    return () => clearTimeout(timer);
  }, [iframeKey]);

  // Sync pins to live iframe so they scroll with page natively
  const syncPinsToIframe = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'HEXTORQ_SYNC_PINS',
            pins: annotations.map((a) => ({
              ...a,
              document_y: a.document_y !== undefined ? a.document_y : (a.position_y / 100) * 900,
            })),
            activePinId,
          },
          '*'
        );
      } catch (e) {}
    }
  };

  React.useEffect(() => {
    syncPinsToIframe();
  }, [annotations, activePinId, isFrameReady]);

  React.useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'HEXTORQ_SET_PIN_MODE',
            enabled: isAddMode,
          },
          '*'
        );
      } catch (e) {}
    }
  }, [isAddMode]);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === 'HEXTORQ_FRAME_READY') {
        setIsFrameReady(true);
        setIsIframeLoading(false);
        syncPinsToIframe();
      }

      if (event.data.type === 'HEXTORQ_STUDIO_SCROLL') {
        setIframeScrollY(event.data.scrollY || 0);
      }

      if (event.data.type === 'HEXTORQ_SELECT_PIN') {
        setActivePinId(event.data.pinId);
        setIsInspectorOpen(true);
      }

      if (event.data.type === 'HEXTORQ_PIN_DROPPED') {
        setDraftPin({
          x: event.data.position_x,
          y: event.data.position_y,
          document_y: event.data.document_y,
          title: '',
          description: '',
          priority: 'medium',
        });
        setIsAddMode(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [annotations, activePinId]);

  const handleSelectPin = (anno: VisualAnnotation) => {
    setActivePinId(anno.id);
    const docY = anno.document_y !== undefined ? anno.document_y : (anno.position_y / 100) * 900;
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'HEXTORQ_SCROLL_TO',
            top: Math.max(0, docY - 140),
          },
          '*'
        );
      } catch (e) {}
    }
  };

  // New pin draft state
  const [draftPin, setDraftPin] = useState<{
    x: number;
    y: number;
    document_y?: number;
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

  // Active target deployment URL (defaults to live Vercel deployment)
  const targetUrl = initialPreview?.deployment_url || 'https://harry-clinton.vercel.app';
  const proxyUrl = `/api/proxy-preview?url=${encodeURIComponent(targetUrl)}`;

  // Viewport sizes
  const viewportStyles = {
    desktop: isMaximized ? 'w-full max-w-[1600px]' : 'w-full max-w-[1440px]',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  const viewportDimensions = {
    desktop: '1440 × 900',
    tablet: '768 × 1024',
    mobile: '375 × 812',
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddMode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2));
    const y = Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2));
    const pageY = Math.round((y / 100) * (canvasRef.current.clientHeight || 900) + iframeScrollY);

    setDraftPin({
      x,
      y,
      document_y: pageY,
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
        page_path: '/',
        viewport_width: viewport === 'desktop' ? 1440 : viewport === 'tablet' ? 768 : 375,
        viewport_height: 900,
        position_x: draftPin.x,
        position_y: draftPin.y,
        document_y: draftPin.document_y,
        element_selector: '#live-preview-viewport',
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
        tags: ['visual-feedback', 'review-studio', 'live-vercel'],
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

  const handleDeleteAnnotation = (anno: VisualAnnotation) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove Review Pin #${anno.pin_number}: "${anno.title}"?`
    );
    if (!confirmDelete) return;

    try {
      db.deleteAnnotation(anno.id, currentUser);
      const updated = db.getVisualAnnotations(project.id, currentUser);
      setAnnotations(updated);
      if (activePinId === anno.id) {
        setActivePinId(null);
      }
    } catch (err: any) {
      alert(err.message);
    }
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
    <div
      className={`flex flex-col min-h-0 bg-[#07080C] overflow-hidden select-none transition-all ${
        isMaximized ? 'fixed inset-0 z-50 w-screen h-screen' : 'flex-1'
      }`}
    >
      {/* Studio Precision Toolbar */}
      <div className="border-b border-white/[0.07] bg-[#0A0B10] px-4 py-2 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* Viewport Segmented Control */}
          <div className="flex items-center gap-0.5 bg-[#12141C] border border-white/[0.07] p-0.5 rounded-lg">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewport === 'desktop'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1440px</span>
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewport === 'tablet'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">768px</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewport === 'mobile'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">375px</span>
            </button>
          </div>

          {/* Mode Switcher: Browse vs Pin Feedback */}
          <div className="flex items-center gap-0.5 bg-[#12141C] border border-white/[0.07] p-0.5 rounded-lg">
            <button
              onClick={() => setIsAddMode(false)}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                !isAddMode
                  ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/25 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Click links, buttons, and scroll the live website"
            >
              <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Browse & Click Site</span>
            </button>
            <button
              onClick={() => setIsAddMode(true)}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                isAddMode
                  ? 'bg-amber-400 text-zinc-950 font-bold border border-amber-300 shadow-md animate-pulse'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Click on the page to drop a visual feedback pin"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Drop Pin Feedback</span>
            </button>
          </div>

          {/* Reload Preview Button */}
          <button
            onClick={() => {
              setIsIframeLoading(true);
              setIframeKey((prev) => prev + 1);
            }}
            title="Reload live deployment frame"
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-100 border border-white/[0.08] transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isIframeLoading ? 'animate-spin text-zinc-200' : ''}`} />
          </button>
        </div>

        {/* Live Vercel Status & View Controls */}
        <div className="flex items-center gap-2.5">
          {/* Full Screen Mode Toggle */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              isMaximized
                ? 'bg-zinc-100 text-zinc-950 font-semibold border-white shadow-xs'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]'
            }`}
            title={isMaximized ? 'Exit Full Screen Mode' : 'Expand Studio to Full Screen'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isMaximized ? 'Exit Full Screen' : 'Full Screen Studio'}</span>
          </button>

          {/* Toggle Pins Sidebar */}
          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              !isInspectorOpen
                ? 'bg-amber-400/15 text-amber-300 font-semibold border-amber-400/30'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]'
            }`}
            title={isInspectorOpen ? 'Hide Pins Panel to maximize preview' : 'Open Pins Panel'}
          >
            {isInspectorOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isInspectorOpen ? 'Hide Pins' : `Pins (${annotations.length})`}</span>
          </button>

          <div className="flex items-center gap-2 text-xs bg-emerald-500/[0.08] border border-emerald-500/20 px-2.5 py-1 rounded-md text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Vercel Live</span>
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              title="Open live site in new tab"
              className="text-emerald-300 hover:text-white flex items-center gap-1 ml-1"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

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
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 bg-[#050608] min-h-0 overflow-auto flex items-center justify-center p-3 sm:p-4 relative">
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className={`${viewportStyles[viewport]} h-full ${
              isMaximized ? 'max-h-[calc(100vh-65px)]' : 'max-h-[calc(100vh-210px)]'
            } min-h-[580px] rounded-xl border border-white/[0.08] bg-[#0E1017] shadow-2xl relative transition-all duration-200 flex flex-col overflow-hidden ${
              isAddMode ? 'cursor-crosshair ring-2 ring-amber-400/60 shadow-amber-500/10' : 'cursor-default'
            }`}
          >
            {/* Minimalist Browser Frame Bar */}
            <div className="border-b border-white/[0.07] bg-[#12141D] px-3.5 py-2 flex items-center justify-between text-xs text-zinc-400 font-mono shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="bg-[#090A0E] px-3 py-1 rounded text-[11px] text-zinc-300 border border-white/[0.05] ml-2 flex items-center gap-1.5">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="truncate max-w-[320px]">{targetUrl}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-500 font-mono">{viewportDimensions[viewport]}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-mono uppercase">
                  LIVE VERCEL
                </span>
              </div>
            </div>

            {/* Frame Viewport & Interactive Layer */}
            <div className="relative flex-1 bg-black overflow-hidden">
              {/* Live Webpage via Secure Proxy */}
              <iframe
                ref={iframeRef}
                key={iframeKey}
                src={proxyUrl}
                title="Harry Clinton Bespoke Menswear - Live Vercel Staging"
                onLoad={() => {
                  setIsIframeLoading(false);
                  setIsFrameReady(true);
                  syncPinsToIframe();
                }}
                className="w-full h-full border-0 bg-neutral-950"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
              />

              {/* Click Interception Layer ONLY when Pin Mode is Active */}
              {isAddMode && (
                <div
                  onClick={handleCanvasClick}
                  className="absolute inset-0 z-20 cursor-crosshair bg-amber-500/[0.08] border-2 border-dashed border-amber-400/50 flex items-start justify-center pt-3 pointer-events-auto select-none"
                >
                  <div className="px-3.5 py-1.5 rounded-full bg-amber-400 text-zinc-950 text-xs font-bold shadow-xl flex items-center gap-1.5 pointer-events-none animate-bounce">
                    <MousePointer className="w-3.5 h-3.5" />
                    <span>Click anywhere on the website to drop review pin</span>
                  </div>
                </div>
              )}

              {/* Visual Feedback Pins Placed on Canvas (Fallback before frame sync) */}
              {!isFrameReady &&
                annotations.map((anno) => {
                  const isResolved = anno.status === 'resolved';
                  const isSelected = activePinId === anno.id;
                  const docY = anno.document_y !== undefined ? anno.document_y : (anno.position_y / 100) * 900;
                  const screenY = docY - iframeScrollY;
                  return (
                    <div
                      key={anno.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPin(anno);
                      }}
                      style={{
                        left: `${anno.position_x}%`,
                        top: `${screenY}px`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group transition-all transform pointer-events-auto ${
                        isSelected ? 'scale-115' : 'hover:scale-105'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shadow-2xl border transition-all ${
                          isResolved
                            ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            : isSelected
                            ? 'bg-amber-400 text-zinc-950 border-white ring-4 ring-amber-400/30'
                            : 'bg-zinc-900 text-white border-white/30 hover:border-white'
                        }`}
                      >
                        {anno.pin_number}
                      </div>

                      {/* Micro Tooltip on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block z-40 w-48 p-2 rounded-lg bg-[#0E1017] border border-white/[0.1] text-zinc-200 text-xs shadow-2xl pointer-events-none">
                        <p className="font-semibold text-zinc-100 truncate">{anno.title}</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5 uppercase">
                          {anno.priority} · {anno.status}
                        </p>
                      </div>
                    </div>
                  );
                })}

              {/* Draft Marker */}
              {draftPin && (
                <div
                  style={{
                    left: `${draftPin.x}%`,
                    top: draftPin.document_y !== undefined ? `${draftPin.document_y - iframeScrollY}px` : `${draftPin.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-zinc-950 font-bold flex items-center justify-center text-sm border-2 border-white animate-pulse shadow-2xl font-mono">
                    +
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Inspector & Discussion Sidebar */}
        {isInspectorOpen && (
          <div className="w-88 border-l border-white/[0.07] bg-[#0A0B10] flex flex-col shrink-0 animate-in slide-in-from-right duration-150">
          <div className="p-3 border-b border-white/[0.07] flex items-center justify-between">
            <span className="font-semibold text-zinc-100 text-xs">Review Pins ({annotations.length})</span>
            <div className="flex items-center gap-1 text-[11px] bg-white/[0.04] p-0.5 rounded-md border border-white/[0.06]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-0.5 rounded ${
                  statusFilter === 'all' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-2 py-0.5 rounded ${
                  statusFilter === 'open' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-2 py-0.5 rounded ${
                  statusFilter === 'resolved' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400'
                }`}
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
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      activeAnnotation.status === 'resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-white/[0.06] text-zinc-300'
                    }`}
                  >
                    {activeAnnotation.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-zinc-100 text-xs">
                    Pin #{activeAnnotation.pin_number}: {activeAnnotation.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{activeAnnotation.description}</p>
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
                  <button
                    onClick={() => handleDeleteAnnotation(activeAnnotation)}
                    className="px-2.5 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-xs text-rose-300 hover:text-rose-200 border border-rose-500/20 font-medium flex items-center gap-1.5 transition-colors ml-auto"
                    title="Remove this review pin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Pin</span>
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
                    onClick={() => handleSelectPin(anno)}
                    className="p-3.5 hover:bg-white/[0.03] cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-200 border border-white/10 text-[11px] font-mono font-bold flex items-center justify-center">
                        {anno.pin_number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                            anno.status === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-white/[0.05] text-zinc-400'
                          }`}
                        >
                          {anno.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnotation(anno);
                          }}
                          className="opacity-40 hover:opacity-100 p-1 rounded hover:bg-rose-500/15 text-zinc-400 hover:text-rose-400 transition-all"
                          title="Remove review pin"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
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
        )}
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
                  placeholder="https://harry-clinton.vercel.app"
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
