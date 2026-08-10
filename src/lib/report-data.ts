export type JobStage =
  | "reading_template"
  | "capturing_graphs"
  | "building_document"
  | "generating_pdf"
  | "completed"
  | "failed";

export const reportJobs: Array<{
  id: string;
  name: string;
  template: string;
  stage: JobStage;
  progress: number;
  started: string;
  by: string;
}> = [
  { id: "JOB-2041", name: "NB Monthly Infrastructure Report", template: "MTL Monthly Report.docx", stage: "completed", progress: 100, started: "Today 06:04", by: "Automation Scheduler" },
  { id: "JOB-2040", name: "FCB Weekly Link Report", template: "MTL Weekly Summary.docx", stage: "capturing_graphs", progress: 42, started: "Today 05:58", by: "C. Mkandawire" },
  { id: "JOB-2039", name: "All Customers Daily Summary", template: "MTL Daily Summary.docx", stage: "generating_pdf", progress: 88, started: "Today 05:41", by: "Automation Scheduler" },
  { id: "JOB-2038", name: "Escom Monthly SLA Report", template: "MTL SLA Report.docx", stage: "failed", progress: 61, started: "Today 04:12", by: "C. Mkandawire" },
  { id: "JOB-2037", name: "Airtel Transit Weekly Report", template: "MTL Weekly Summary.docx", stage: "completed", progress: 100, started: "Yesterday 07:02", by: "Automation Scheduler" },
];

export const stageLabels: Record<JobStage, string> = {
  reading_template: "Reading Word template",
  capturing_graphs: "Capturing graphs",
  building_document: "Building document",
  generating_pdf: "Generating PDF",
  completed: "Completed",
  failed: "Failed",
};

export const wordTemplates: Array<{
  id: string;
  file: string;
  label: string;
  uploaded: string;
  by: string;
  placeholders: number;
  graphSlots: number;
  active: boolean;
}> = [
  { id: "TPL-01", file: "MTL_Monthly_Report_Template.docx", label: "MTL Monthly Infrastructure Report", uploaded: "01 Aug 2026 08:14", by: "Infra Report Admin", placeholders: 18, graphSlots: 9, active: true },
  { id: "TPL-02", file: "MTL_Weekly_Summary_Template.docx", label: "MTL Weekly Performance Summary", uploaded: "22 Jul 2026 10:02", by: "C. Mkandawire", placeholders: 12, graphSlots: 6, active: false },
  { id: "TPL-03", file: "MTL_SLA_Report_Template.docx", label: "MTL SLA Compliance Report", uploaded: "14 Jul 2026 16:41", by: "Infra Report Admin", placeholders: 21, graphSlots: 11, active: false },
  { id: "TPL-04", file: "MTL_Daily_Summary_Template.docx", label: "MTL Daily Summary", uploaded: "02 Jul 2026 07:20", by: "C. Mkandawire", placeholders: 8, graphSlots: 4, active: false },
];

export const templatePlaceholders: Array<{
  token: string;
  meaning: string;
  source: "graph" | "text" | "table" | "date";
  todaysValue: string;
}> = [
  { token: "{{report_date}}", meaning: "Reporting day printed on the cover page", source: "date", todaysValue: "10 Aug 2026" },
  { token: "{{customer_name}}", meaning: "Customer the report is prepared for", source: "text", todaysValue: "National Bank of Malawi" },
  { token: "{{graph_traffic_primary}}", meaning: "Primary link traffic graph screenshot", source: "graph", todaysValue: "Captured 06:02 · SolarWinds" },
  { token: "{{graph_availability}}", meaning: "Availability graph for the reporting period", source: "graph", todaysValue: "Captured 06:03 · Observium" },
  { token: "{{graph_latency}}", meaning: "Latency graph for the primary link", source: "graph", todaysValue: "Captured 06:04 · Observium" },
  { token: "{{peak_utilisation}}", meaning: "Peak utilisation read from the day's graph", source: "text", todaysValue: "78% (14:20)" },
  { token: "{{availability_table}}", meaning: "Per-link availability table rows", source: "table", todaysValue: "6 links populated" },
  { token: "{{observations}}", meaning: "Observation paragraph derived from the day's figures", source: "text", todaysValue: "Drafted · editable" },
];

export const activityLogs: Array<{
  time: string;
  actor: string;
  action: string;
  resource: string;
  result: "success" | "failure";
  ip: string;
}> = [
  { time: "Today 08:41", actor: "christasia@mtl.com", action: "report.job_created", resource: "JOB-2041", result: "success", ip: "10.20.4.51" },
  { time: "Today 08:12", actor: "infrareportadmin@mtl.com", action: "user.login", resource: "session", result: "success", ip: "10.10.2.14" },
  { time: "Today 07:58", actor: "christasia@mtl.com", action: "template.uploaded", resource: "MTL_Monthly_Report_Template.docx", result: "success", ip: "10.20.4.51" },
  { time: "Today 06:44", actor: "t.banda@mtl.com", action: "user.login_failed", resource: "session", result: "failure", ip: "10.30.1.77" },
  { time: "Today 06:12", actor: "christasia@mtl.com", action: "infrastructure.uploaded", resource: "MTL_Infrastructure_Aug2026.xlsx", result: "success", ip: "10.20.4.51" },
  { time: "Today 05:41", actor: "system", action: "report.completed", resource: "JOB-2039", result: "success", ip: "127.0.0.1" },
  { time: "Yesterday 22:10", actor: "c.mvula@mtl.com", action: "report.downloaded", resource: "Monthly SLA Report — Jul 2026", result: "success", ip: "10.20.9.4" },
  { time: "Yesterday 19:33", actor: "l.chirwa@mtl.com", action: "monitoring.credentials_changed", resource: "SolarWinds (primary)", result: "failure", ip: "10.10.7.19" },
];

export const systemUsers: Array<{
  name: string;
  email: string;
  role: "NOC Engineer" | "Supervisor" | "System Administrator";
  status: "Active" | "Suspended";
  lastLogin: string;
  reports: number;
}> = [
  { name: "Christasia Mkandawire", email: "christasia@mtl.com", role: "NOC Engineer", status: "Active", lastLogin: "Today 08:41", reports: 62 },
  { name: "Infra Report Admin", email: "infrareportadmin@mtl.com", role: "System Administrator", status: "Active", lastLogin: "Today 08:12", reports: 4 },
  { name: "Grace Phiri", email: "g.phiri@mtl.com", role: "Supervisor", status: "Active", lastLogin: "Today 07:45", reports: 38 },
  { name: "Tawonga Banda", email: "t.banda@mtl.com", role: "NOC Engineer", status: "Active", lastLogin: "Today 06:58", reports: 27 },
  { name: "Chimwemwe Mvula", email: "c.mvula@mtl.com", role: "NOC Engineer", status: "Active", lastLogin: "Yesterday 22:10", reports: 19 },
  { name: "Lucius Chirwa", email: "l.chirwa@mtl.com", role: "NOC Engineer", status: "Suspended", lastLogin: "02 Aug 2026 19:33", reports: 11 },
];

export const integrations: Array<{
  name: string;
  kind: string;
  url: string;
  status: "connected" | "degraded" | "disconnected";
  lastUsed: string;
  detail: string;
}> = [
  { name: "SolarWinds (primary)", kind: "Graph source", url: "https://solarwinds.mtl.internal", status: "connected", lastUsed: "Today 06:04", detail: "Browser session · credentials encrypted at rest" },
  { name: "Observium", kind: "Graph source", url: "https://observium.mtl.internal", status: "connected", lastUsed: "Today 06:03", detail: "Browser session · graph refs mapped per interface" },
  { name: "Mock provider", kind: "Development source", url: "local://mock", status: "connected", lastUsed: "Today 05:12", detail: "Used for template dry-runs without live access" },
  { name: "MTL Mail Relay", kind: "Report delivery", url: "smtp://mail.mtl.internal:587", status: "degraded", lastUsed: "Today 06:10", detail: "Two delivery retries in the last 24 hours" },
  { name: "Document Archive (SMB)", kind: "Storage", url: "smb://files.mtl.internal/reports", status: "disconnected", lastUsed: "05 Aug 2026 18:22", detail: "Share credentials expired · reconnect required" },
];