CREATE TABLE public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'NOC Engineer',
  status text NOT NULL DEFAULT 'Active',
  integration text NOT NULL DEFAULT 'None assigned',
  is_protected boolean NOT NULL DEFAULT false,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_users TO service_role;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'Graph source',
  base_url text NOT NULL,
  detail text,
  status text NOT NULL DEFAULT 'unknown',
  owner_email text,
  login_username text,
  login_password text,
  last_checked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.integrations TO service_role;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.infrastructure_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  storage_path text,
  size_bytes bigint NOT NULL DEFAULT 0,
  uploaded_by text,
  status text NOT NULL DEFAULT 'imported',
  sheet_names jsonb NOT NULL DEFAULT '[]'::jsonb,
  detected_columns jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.infrastructure_files TO service_role;
ALTER TABLE public.infrastructure_files ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.infrastructure_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES public.infrastructure_files(id) ON DELETE CASCADE,
  customer text,
  link_name text NOT NULL,
  circuit_id text,
  bandwidth_mbps integer,
  region text,
  device text,
  interface_name text,
  observium_ref text,
  solarwinds_ref text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX infrastructure_links_file_idx ON public.infrastructure_links(file_id);
GRANT ALL ON public.infrastructure_links TO service_role;
ALTER TABLE public.infrastructure_links ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  filename text NOT NULL,
  storage_path text,
  size_bytes bigint NOT NULL DEFAULT 0,
  uploaded_by text,
  is_active boolean NOT NULL DEFAULT false,
  placeholders jsonb NOT NULL DEFAULT '[]'::jsonb,
  graph_slots jsonb NOT NULL DEFAULT '[]'::jsonb,
  body_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.report_templates TO service_role;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_id uuid REFERENCES public.report_templates(id) ON DELETE SET NULL,
  template_label text,
  status text NOT NULL DEFAULT 'draft',
  format text NOT NULL DEFAULT 'PDF',
  created_by text,
  period_label text,
  html text,
  error_message text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.report_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  slot_key text NOT NULL,
  slot_label text,
  platform text NOT NULL,
  source_url text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  image_path text,
  checksum text,
  ocr_text text,
  ocr_ok boolean,
  approved boolean NOT NULL DEFAULT false,
  captured_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX report_captures_report_idx ON public.report_captures(report_id);
GRANT ALL ON public.report_captures TO service_role;
ALTER TABLE public.report_captures ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text NOT NULL,
  action text NOT NULL,
  resource text,
  result text NOT NULL DEFAULT 'success',
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_logs_created_idx ON public.activity_logs(created_at DESC);
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_users (name, email, role, status, integration, is_protected) VALUES
  ('Christasia Mkandawire', 'christasia@mtl.com', 'NOC Engineer', 'Active', 'SolarWinds (primary), Observium', false),
  ('Infra Report Admin', 'infrareportadmin@mtl.com', 'System Administrator', 'Active', 'All integrations', true);

INSERT INTO public.integrations (name, kind, base_url, detail, status) VALUES
  ('SolarWinds (primary)', 'Graph source', 'https://solarwinds.mtl.internal', 'Browser session · credentials stored server-side', 'unknown'),
  ('Observium', 'Graph source', 'https://observium.mtl.internal', 'Browser session · graph refs mapped per link', 'unknown');