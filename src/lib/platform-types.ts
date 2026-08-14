// Client-safe shared types for the MTL report platform.

export type IntegrationRow = {
  id: string;
  name: string;
  kind: string;
  base_url: string;
  detail: string | null;
  status: string;
  owner_email: string | null;
  login_username: string | null;
  has_password: boolean;
  last_checked_at: string | null;
  last_used_at: string | null;
};

export type ProbeResult = {
  ok: boolean;
  status: string;
  message: string;
  httpStatus: number | null;
  latencyMs: number;
};

export type TemplatePlaceholder = { token: string; kind: "graph" | "text" | "table" | "date" };
export type TemplateGraphSlot = { key: string; label: string; platform: "SolarWinds" | "Observium" };

export type TemplateRow = {
  id: string;
  label: string;
  filename: string;
  size_bytes: number;
  uploaded_by: string | null;
  is_active: boolean;
  placeholders: TemplatePlaceholder[];
  graph_slots: TemplateGraphSlot[];
  created_at: string;
};

export type CaptureRow = {
  id: string;
  slot_key: string;
  slot_label: string | null;
  platform: string;
  source_url: string | null;
  status: string;
  error_message: string | null;
  checksum: string | null;
  ocr_text: string | null;
  ocr_ok: boolean | null;
  approved: boolean;
  captured_at: string | null;
  preview_url?: string | null;
};

export type ReportRow = {
  id: string;
  name: string;
  template_label: string | null;
  status: string;
  format: string;
  created_by: string | null;
  period_label: string | null;
  error_message: string | null;
  approved_at: string | null;
  created_at: string;
};

export type GenerateResult = {
  report: ReportRow;
  captures: CaptureRow[];
  html: string;
  platformErrors: Array<{ platform: string; url: string; message: string }>;
};

export type InfraFileRow = {
  id: string;
  filename: string;
  size_bytes: number;
  uploaded_by: string | null;
  status: string;
  sheet_names: string[];
  detected_columns: string[];
  summary: Record<string, number>;
  error_message: string | null;
  created_at: string;
};

export type InfraLinkRow = {
  id: string;
  customer: string | null;
  link_name: string;
  circuit_id: string | null;
  bandwidth_mbps: number | null;
  region: string | null;
  device: string | null;
  interface_name: string | null;
  observium_ref: string | null;
  solarwinds_ref: string | null;
};

export type AppUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  integration: string;
  is_protected: boolean;
  last_login_at: string | null;
};

export type LogRow = {
  id: string;
  actor: string;
  action: string;
  resource: string | null;
  result: string;
  ip: string | null;
  created_at: string;
};