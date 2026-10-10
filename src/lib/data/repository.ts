import {
  UserProfile,
  Project,
  Milestone,
  ProjectUpdate,
  PreviewEnvironment,
  VisualAnnotation,
  Ticket,
  ProjectNote,
  ProjectFile,
  Meeting,
  Invoice,
  MilestoneApproval,
  ActivityEvent,
  NotificationItem,
  ClientOrg,
  Agency,
} from '@/types';
import {
  INITIAL_PROFILES,
  INITIAL_AGENCY,
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_MILESTONES,
  INITIAL_PREVIEWS,
  INITIAL_ANNOTATIONS,
  INITIAL_TICKETS,
  INITIAL_UPDATES,
  INITIAL_FILES,
  INITIAL_NOTES,
  INITIAL_MEETINGS,
  INITIAL_INVOICES,
  INITIAL_APPROVALS,
  INITIAL_ACTIVITY,
  INITIAL_NOTIFICATIONS,
} from './mock-db';

// In-memory relational store that acts as server data layer
class RepositoryStore {
  profiles: UserProfile[] = [...INITIAL_PROFILES];
  agency: Agency = { ...INITIAL_AGENCY };
  clients: ClientOrg[] = [...INITIAL_CLIENTS];
  projects: Project[] = [...INITIAL_PROJECTS];
  milestones: Milestone[] = [...INITIAL_MILESTONES];
  previews: PreviewEnvironment[] = [...INITIAL_PREVIEWS];
  annotations: VisualAnnotation[] = [...INITIAL_ANNOTATIONS];
  tickets: Ticket[] = [...INITIAL_TICKETS];
  updates: ProjectUpdate[] = [...INITIAL_UPDATES];
  files: ProjectFile[] = [...INITIAL_FILES];
  notes: ProjectNote[] = [...INITIAL_NOTES];
  meetings: Meeting[] = [...INITIAL_MEETINGS];
  invoices: Invoice[] = [...INITIAL_INVOICES];
  approvals: MilestoneApproval[] = [...INITIAL_APPROVALS];
  activity: ActivityEvent[] = [...INITIAL_ACTIVITY];
  notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

  // Helper: Find client entity for a user
  getClientForUser(userId: string): ClientOrg | undefined {
    // Map known clients
    if (userId === 'user-client-03') {
      return this.clients.find(c => c.id === 'client-apex-01');
    }
    if (userId === 'user-client-04') {
      return this.clients.find(c => c.id === 'client-horizon-02');
    }
    return undefined;
  }

  // Security check: verify user can access project
  verifyProjectAccess(projectId: string, user: UserProfile): Project {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    if (user.role === 'agency_admin' || user.role === 'agency_developer') {
      return project;
    }

    // Client check
    const client = this.getClientForUser(user.id);
    if (!client || project.client_id !== client.id) {
      throw new Error(`Access Denied (403): User ${user.email} is not authorized to access project ${projectId}`);
    }

    return project;
  }

  // Projects
  getProjects(user: UserProfile): Project[] {
    let projs: Project[] = [];
    if (user.role === 'agency_admin' || user.role === 'agency_developer') {
      projs = [...this.projects];
    } else {
      const client = this.getClientForUser(user.id);
      if (!client) return [];
      projs = this.projects.filter(p => p.client_id === client.id);
    }

    return projs.map(p => ({
      ...p,
      client: this.clients.find(c => c.id === p.client_id),
    }));
  }

  getProject(projectId: string, user: UserProfile): Project {
    const project = this.verifyProjectAccess(projectId, user);
    return {
      ...project,
      client: this.clients.find(c => c.id === project.client_id),
    };
  }

  createProject(
    data: Omit<Project, 'id' | 'created_at' | 'updated_at'>,
    user: UserProfile
  ): Project {
    if (user.role !== 'agency_admin') {
      throw new Error('Only agency administrators can create projects.');
    }

    const newProject: Project = {
      ...data,
      id: `proj-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.projects.unshift(newProject);
    this.recordActivity(newProject.id, user.id, 'project', newProject.id, 'created_project', { name: newProject.name }, true);

    return newProject;
  }

  // Milestones
  getMilestones(projectId: string, user: UserProfile): Milestone[] {
    this.verifyProjectAccess(projectId, user);
    return this.milestones
      .filter(m => m.project_id === projectId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  // Previews & Vercel Registrations
  getPreviews(projectId: string, user: UserProfile): PreviewEnvironment[] {
    this.verifyProjectAccess(projectId, user);
    return this.previews.filter(p => p.project_id === projectId);
  }

  getCurrentPreview(projectId: string, user: UserProfile): PreviewEnvironment | undefined {
    this.verifyProjectAccess(projectId, user);
    return this.previews.find(p => p.project_id === projectId && p.is_current && p.status === 'ready');
  }

  registerPreview(
    projectId: string,
    user: UserProfile,
    data: {
      deployment_id: string;
      deployment_url: string;
      git_branch?: string;
      git_commit_sha?: string;
    }
  ): PreviewEnvironment {
    this.verifyProjectAccess(projectId, user);
    if (user.role === 'client') {
      throw new Error('Clients are not permitted to register preview deployments.');
    }

    // Host validation policy
    const urlObj = new URL(data.deployment_url);
    const host = urlObj.hostname;
    const allowed = host.endsWith('.vercel.app') || host.endsWith('.nexus-clients.com') || host === 'localhost' || host === '127.0.0.1';
    if (!allowed) {
      throw new Error(`Security Exception: Host ${host} is not in the approved Vercel deployment policy.`);
    }

    // Mark previous current as false
    this.previews.forEach(p => {
      if (p.project_id === projectId) p.is_current = false;
    });

    const newPreview: PreviewEnvironment = {
      id: `prev-${Date.now().toString(36)}`,
      project_id: projectId,
      deployment_id: data.deployment_id,
      deployment_url: data.deployment_url,
      git_branch: data.git_branch || 'main',
      git_commit_sha: data.git_commit_sha || 'head',
      status: 'ready',
      is_current: true,
      registered_by: user.id,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    this.previews.unshift(newPreview);
    this.recordActivity(projectId, user.id, 'preview', newPreview.id, 'registered_preview', { url: data.deployment_url, branch: data.git_branch }, true);

    return newPreview;
  }

  // Visual Annotations
  getVisualAnnotations(projectId: string, user: UserProfile): VisualAnnotation[] {
    this.verifyProjectAccess(projectId, user);
    const isClient = user.role === 'client';

    return this.annotations
      .filter(a => a.project_id === projectId)
      .map(anno => ({
        ...anno,
        author: this.profiles.find(p => p.id === anno.author_id),
        comments: (anno.comments || [])
          .filter(c => (!isClient ? true : !c.is_internal_only))
          .map(c => ({
            ...c,
            author: this.profiles.find(p => p.id === c.author_id),
          })),
      }));
  }

  createAnnotation(
    projectId: string,
    user: UserProfile,
    data: {
      preview_id: string;
      page_path: string;
      viewport_width: number;
      viewport_height: number;
      position_x: number;
      position_y: number;
      element_selector?: string;
      screenshot_url?: string;
      title: string;
      description: string;
      priority: VisualAnnotation['priority'];
    }
  ): VisualAnnotation {
    this.verifyProjectAccess(projectId, user);
    const existingForProject = this.annotations.filter(a => a.project_id === projectId);
    const pinNumber = existingForProject.length + 1;

    const newAnno: VisualAnnotation = {
      id: `anno-${Date.now().toString(36)}`,
      project_id: projectId,
      preview_id: data.preview_id,
      pin_number: pinNumber,
      page_path: data.page_path,
      viewport_width: data.viewport_width,
      viewport_height: data.viewport_height,
      position_x: data.position_x,
      position_y: data.position_y,
      element_selector: data.element_selector,
      screenshot_url: data.screenshot_url,
      status: 'open',
      priority: data.priority,
      author_id: user.id,
      title: data.title,
      description: data.description,
      created_at: new Date().toISOString(),
      comments: [],
    };

    this.annotations.unshift(newAnno);
    this.recordActivity(projectId, user.id, 'annotation', newAnno.id, 'pinned_feedback', { pin_number: pinNumber, path: data.page_path }, true);

    return newAnno;
  }

  addAnnotationComment(
    annotationId: string,
    user: UserProfile,
    content: string,
    isInternal: boolean
  ) {
    const anno = this.annotations.find(a => a.id === annotationId);
    if (!anno) throw new Error('Annotation not found');
    this.verifyProjectAccess(anno.project_id, user);

    if (user.role === 'client' && isInternal) {
      isInternal = false; // Clients cannot create internal-only notes
    }

    if (!anno.comments) anno.comments = [];
    const newComment = {
      id: `c-${Date.now().toString(36)}`,
      annotation_id: annotationId,
      author_id: user.id,
      content,
      is_internal_only: isInternal,
      created_at: new Date().toISOString(),
      author: user,
    };

    anno.comments.push(newComment);
    return newComment;
  }

  deleteAnnotation(annotationId: string, user: UserProfile): boolean {
    const annoIndex = this.annotations.findIndex(a => a.id === annotationId);
    if (annoIndex === -1) throw new Error('Annotation not found');
    const anno = this.annotations[annoIndex];
    this.verifyProjectAccess(anno.project_id, user);

    this.annotations.splice(annoIndex, 1);
    this.recordActivity(
      anno.project_id,
      user.id,
      'annotation',
      anno.id,
      'removed_visual_feedback',
      { pin_number: anno.pin_number, title: anno.title },
      true
    );
    return true;
  }

  // Tickets
  getTickets(projectId: string, user: UserProfile): Ticket[] {
    this.verifyProjectAccess(projectId, user);
    const isClient = user.role === 'client';

    return this.tickets
      .filter(t => t.project_id === projectId && (!isClient ? true : t.is_client_visible))
      .map(ticket => ({
        ...ticket,
        assignee: this.profiles.find(p => p.id === ticket.assignee_id),
        reporter: this.profiles.find(p => p.id === ticket.reporter_id),
        comments: (ticket.comments || [])
          .filter(c => (!isClient ? true : !c.is_internal_only))
          .map(c => ({
            ...c,
            author: this.profiles.find(p => p.id === c.author_id),
          })),
      }));
  }

  createTicket(
    projectId: string,
    user: UserProfile,
    data: {
      annotation_id?: string;
      title: string;
      description: string;
      priority: Ticket['priority'];
      assignee_id?: string;
      is_client_visible?: boolean;
      tags?: string[];
    }
  ): Ticket {
    this.verifyProjectAccess(projectId, user);
    const existing = this.tickets.filter(t => t.project_id === projectId);
    const ticketNumber = 100 + existing.length + 1;

    const newTicket: Ticket = {
      id: `tkt-${Date.now().toString(36)}`,
      project_id: projectId,
      annotation_id: data.annotation_id,
      ticket_number: ticketNumber,
      title: data.title,
      description: data.description,
      status: 'open',
      priority: data.priority,
      assignee_id: data.assignee_id,
      reporter_id: user.id,
      is_client_visible: data.is_client_visible ?? true,
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments: [],
    };

    this.tickets.unshift(newTicket);
    this.recordActivity(projectId, user.id, 'ticket', newTicket.id, 'created_ticket', { ticket_number: ticketNumber, title: data.title }, newTicket.is_client_visible);

    return newTicket;
  }

  // Project Updates
  getUpdates(projectId: string, user: UserProfile): ProjectUpdate[] {
    this.verifyProjectAccess(projectId, user);
    const isClient = user.role === 'client';

    return this.updates
      .filter(u => u.project_id === projectId && (!isClient ? true : u.is_client_visible))
      .map(u => ({
        ...u,
        author: this.profiles.find(p => p.id === u.author_id),
      }));
  }

  createUpdate(
    projectId: string,
    user: UserProfile,
    title: string,
    content: string,
    isClientVisible: boolean
  ): ProjectUpdate {
    this.verifyProjectAccess(projectId, user);
    if (user.role === 'client') {
      throw new Error('Clients cannot publish agency project updates.');
    }

    const newUpdate: ProjectUpdate = {
      id: `upd-${Date.now().toString(36)}`,
      project_id: projectId,
      author_id: user.id,
      title,
      content,
      is_client_visible: isClientVisible,
      created_at: new Date().toISOString(),
    };

    this.updates.unshift(newUpdate);
    this.recordActivity(projectId, user.id, 'update', newUpdate.id, 'published_update', { title }, isClientVisible);

    return newUpdate;
  }

  // Files
  getFiles(projectId: string, user: UserProfile): ProjectFile[] {
    this.verifyProjectAccess(projectId, user);
    const isClient = user.role === 'client';

    return this.files
      .filter(f => f.project_id === projectId && (!isClient ? true : f.is_client_visible))
      .map(f => ({
        ...f,
        uploader: this.profiles.find(p => p.id === f.uploader_id),
      }));
  }

  createFile(
    projectId: string,
    user: UserProfile,
    file_name: string,
    file_size: number,
    mime_type: string,
    category: ProjectFile['category'],
    isClientVisible: boolean
  ): ProjectFile {
    this.verifyProjectAccess(projectId, user);
    const newFile: ProjectFile = {
      id: `file-${Date.now().toString(36)}`,
      project_id: projectId,
      uploader_id: user.id,
      file_name,
      file_size,
      mime_type,
      storage_path: `projects/${projectId}/${category}/${file_name}`,
      download_url: '#',
      is_client_visible: isClientVisible,
      category,
      created_at: new Date().toISOString(),
    };

    this.files.unshift(newFile);
    this.recordActivity(projectId, user.id, 'file', newFile.id, 'uploaded_file', { file_name }, isClientVisible);

    return newFile;
  }

  // Notes
  getNotes(projectId: string, user: UserProfile): ProjectNote[] {
    this.verifyProjectAccess(projectId, user);
    const isClient = user.role === 'client';

    return this.notes
      .filter(n => n.project_id === projectId && (!isClient ? true : n.is_client_visible))
      .map(n => ({
        ...n,
        author: this.profiles.find(p => p.id === n.author_id),
      }));
  }

  createNote(
    projectId: string,
    user: UserProfile,
    title: string,
    content: string,
    category: string,
    isClientVisible: boolean
  ): ProjectNote {
    this.verifyProjectAccess(projectId, user);
    const newNote: ProjectNote = {
      id: `note-${Date.now().toString(36)}`,
      project_id: projectId,
      author_id: user.id,
      title,
      content,
      category,
      is_client_visible: isClientVisible,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.notes.unshift(newNote);
    return newNote;
  }

  // Meetings
  getMeetings(projectId: string, user: UserProfile): Meeting[] {
    this.verifyProjectAccess(projectId, user);
    return this.meetings
      .filter(m => m.project_id === projectId)
      .map(m => ({
        ...m,
        creator: this.profiles.find(p => p.id === m.created_by),
      }));
  }

  createMeeting(
    projectId: string,
    user: UserProfile,
    title: string,
    description: string,
    start_time: string,
    end_time: string,
    time_zone: string
  ): Meeting {
    this.verifyProjectAccess(projectId, user);
    const roomId = `room-${Date.now().toString(36)}`;
    const newMeeting: Meeting = {
      id: `meet-${Date.now().toString(36)}`,
      project_id: projectId,
      title,
      description,
      start_time,
      end_time,
      time_zone,
      status: 'scheduled',
      meeting_room_id: roomId,
      livekit_room_name: `livekit-${roomId}`,
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    this.meetings.unshift(newMeeting);
    this.recordActivity(projectId, user.id, 'meeting', newMeeting.id, 'scheduled_meeting', { title, start_time }, true);

    return newMeeting;
  }

  // Invoices & Billing
  getInvoices(user: UserProfile, projectId?: string): Invoice[] {
    let invs: Invoice[] = [];
    if (user.role === 'agency_admin' || user.role === 'agency_developer') {
      invs = projectId ? this.invoices.filter(i => i.project_id === projectId) : [...this.invoices];
    } else {
      const client = this.getClientForUser(user.id);
      if (!client) return [];
      invs = this.invoices.filter(i => i.client_id === client.id && (!projectId || i.project_id === projectId));
    }

    return invs.map(i => ({
      ...i,
      project: this.projects.find(p => p.id === i.project_id),
      client: this.clients.find(c => c.id === i.client_id),
    }));
  }

  createInvoice(
    projectId: string,
    user: UserProfile,
    data: {
      due_date: string;
      items: Array<{ description: string; quantity: number; unit_price: number; milestone_id?: string }>;
      notes?: string;
    }
  ): Invoice {
    if (user.role !== 'agency_admin') {
      throw new Error('Only agency administrators can issue invoices.');
    }

    const project = this.verifyProjectAccess(projectId, user);
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const invoiceNumber = `NEX-2026-00${this.invoices.length + 50}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now().toString(36)}`,
      project_id: projectId,
      client_id: project.client_id,
      invoice_number: invoiceNumber,
      status: 'issued',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: data.due_date,
      currency: project.currency,
      subtotal,
      tax_amount: 0,
      total_amount: subtotal,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: data.items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        invoice_id: '',
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        amount: it.quantity * it.unit_price,
        milestone_id: it.milestone_id,
        created_at: new Date().toISOString(),
      })),
    };

    newInvoice.items?.forEach(i => (i.invoice_id = newInvoice.id));
    this.invoices.unshift(newInvoice);
    this.recordActivity(projectId, user.id, 'invoice', newInvoice.id, 'issued_invoice', { invoice_number: invoiceNumber, amount: subtotal }, true);

    return newInvoice;
  }

  markInvoicePaid(invoiceId: string, provider: 'stripe' | 'razorpay' | 'bank_transfer', providerPaymentId: string): Invoice {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');
    inv.status = 'paid';
    inv.updated_at = new Date().toISOString();

    this.recordActivity(inv.project_id, 'system', 'invoice', inv.id, 'payment_succeeded', {
      provider,
      payment_id: providerPaymentId,
      amount: inv.total_amount,
    }, true);

    return inv;
  }

  // Milestone Approvals
  approveMilestone(
    projectId: string,
    milestoneId: string,
    clientUser: UserProfile,
    digitalSignature: string,
    notes?: string
  ): MilestoneApproval {
    this.verifyProjectAccess(projectId, clientUser);
    const ms = this.milestones.find(m => m.id === milestoneId && m.project_id === projectId);
    if (!ms) throw new Error('Milestone not found');

    const client = this.getClientForUser(clientUser.id);
    if (!client) throw new Error('User has no associated client profile');

    const approval: MilestoneApproval = {
      id: `appr-${Date.now().toString(36)}`,
      project_id: projectId,
      milestone_id: milestoneId,
      client_id: client.id,
      approved_by: clientUser.id,
      digital_signature: digitalSignature,
      notes,
      ip_address: '198.51.100.88',
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      approver: clientUser,
    };

    ms.status = 'approved';
    ms.approved_at = approval.approved_at;
    ms.approved_by = clientUser.id;

    this.approvals.unshift(approval);
    this.recordActivity(projectId, clientUser.id, 'milestone', milestoneId, 'approved_milestone', {
      milestone_title: ms.title,
      signature: digitalSignature,
    }, true);

    return approval;
  }

  // Activity stream & notifications
  recordActivity(
    projectId: string,
    actorId: string,
    entityType: string,
    entityId: string,
    action: string,
    metadata: Record<string, unknown>,
    isClientVisible: boolean
  ) {
    const event: ActivityEvent = {
      id: `act-${Date.now().toString(36)}`,
      project_id: projectId,
      actor_id: actorId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      metadata,
      is_client_visible: isClientVisible,
      created_at: new Date().toISOString(),
    };
    this.activity.unshift(event);
  }

  getActivity(projectId: string, user: UserProfile): ActivityEvent[] {
    this.verifyProjectAccess(projectId, user);
    const isClient = user.role === 'client';

    return this.activity
      .filter(a => a.project_id === projectId && (!isClient ? true : a.is_client_visible))
      .map(a => ({
        ...a,
        actor: this.profiles.find(p => p.id === a.actor_id),
      }));
  }

  getNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter(n => n.user_id === userId);
  }
}

// Global singleton instance for hot module reloading stability
const globalForRepo = global as unknown as { repoStore: RepositoryStore };
export const db = globalForRepo.repoStore || new RepositoryStore();
if (process.env.NODE_ENV !== 'production') globalForRepo.repoStore = db;
