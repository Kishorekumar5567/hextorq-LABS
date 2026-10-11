export type UserRole = 'agency_admin' | 'agency_developer' | 'client';

export type ProjectStatus = 'planning' | 'active' | 'in_review' | 'completed' | 'archived';
export type ProjectHealth = 'on_track' | 'at_risk' | 'delayed';
export type MilestoneStatus = 'pending' | 'in_progress' | 'ready_for_review' | 'approved';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';
export type ItemPriority = 'low' | 'medium' | 'high' | 'urgent';
export type PreviewStatus = 'active' | 'building' | 'ready' | 'revoked' | 'expired';
export type InvoiceStatus = 'draft' | 'issued' | 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type FileCategory = 'design' | 'specification' | 'contract' | 'asset' | 'screenshot' | 'general';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type NotificationType = 'ticket' | 'milestone' | 'invoice' | 'meeting' | 'feedback' | 'system';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  company_title?: string;
  created_at: string;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  created_at: string;
}

export interface ClientOrg {
  id: string;
  agency_id: string;
  name: string;
  company_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  portal_access_enabled: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  agency_id: string;
  client_id: string;
  name: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  health: ProjectHealth;
  budget: number;
  currency: string;
  start_date: string;
  target_date: string;
  created_at: string;
  updated_at: string;
  client?: ClientOrg;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  order_index: number;
  due_date: string;
  status: MilestoneStatus;
  amount: number;
  currency: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  author_id: string;
  title: string;
  content: string;
  is_client_visible: boolean;
  created_at: string;
  author?: UserProfile;
}

export interface PreviewEnvironment {
  id: string;
  project_id: string;
  deployment_id: string;
  deployment_url: string;
  git_branch?: string;
  git_commit_sha?: string;
  status: PreviewStatus;
  is_current: boolean;
  registered_by: string;
  verified_at: string;
  expires_at?: string;
  created_at: string;
}

export interface VisualAnnotation {
  id: string;
  project_id: string;
  preview_id: string;
  pin_number: number;
  page_path: string;
  viewport_width: number;
  viewport_height: number;
  position_x: number; // 0 - 100 percentage
  position_y: number; // 0 - 100 percentage
  document_y?: number; // Absolute document pixel coordinate
  element_selector?: string;
  screenshot_url?: string;
  status: TicketStatus;
  priority: ItemPriority;
  author_id: string;
  title: string;
  description: string;
  created_at: string;
  resolved_at?: string;
  author?: UserProfile;
  comments?: AnnotationComment[];
}

export interface AnnotationComment {
  id: string;
  annotation_id: string;
  author_id: string;
  content: string;
  is_internal_only: boolean;
  created_at: string;
  author?: UserProfile;
}

export interface Ticket {
  id: string;
  project_id: string;
  annotation_id?: string;
  ticket_number: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: ItemPriority;
  assignee_id?: string;
  reporter_id: string;
  is_client_visible: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  assignee?: UserProfile;
  reporter?: UserProfile;
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  is_internal_only: boolean;
  created_at: string;
  author?: UserProfile;
}

export interface ProjectNote {
  id: string;
  project_id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  is_client_visible: boolean;
  created_at: string;
  updated_at: string;
  author?: UserProfile;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  uploader_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  download_url?: string;
  is_client_visible: boolean;
  category: FileCategory;
  created_at: string;
  uploader?: UserProfile;
}

export interface Meeting {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  time_zone: string;
  status: MeetingStatus;
  meeting_room_id: string;
  livekit_room_name?: string;
  recording_url?: string;
  meeting_notes?: string;
  created_by: string;
  created_at: string;
  creator?: UserProfile;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  milestone_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  project_id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
  project?: Project;
  client?: ClientOrg;
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  provider: 'stripe' | 'razorpay' | 'bank_transfer';
  provider_payment_id?: string;
  provider_order_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  signature?: string;
  idempotent_key: string;
  created_at: string;
}

export interface MilestoneApproval {
  id: string;
  project_id: string;
  milestone_id: string;
  client_id: string;
  approved_by: string;
  digital_signature: string;
  notes?: string;
  ip_address?: string;
  approved_at: string;
  created_at: string;
  approver?: UserProfile;
}

export interface ActivityEvent {
  id: string;
  project_id: string;
  actor_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  metadata: Record<string, unknown>;
  is_client_visible: boolean;
  created_at: string;
  actor?: UserProfile;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}
