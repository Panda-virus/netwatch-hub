export type DeviceStatus = "online" | "warning" | "offline";
export type Severity = "critical" | "warning" | "info";

export type Device = {
  hostname: string;
  type: "Router" | "Switch" | "Firewall" | "Server";
  ip: string;
  location: string;
  region: "South" | "Central" | "North";
  status: DeviceStatus;
  cpu: number;
  memory: number;
  bandwidth: string;
  lastChecked: string;
  source: "Observium" | "SolarWinds";
};

export const devices: Device[] = [
  { hostname: "BLANTYRE-CORE-RTR-01", type: "Router", ip: "10.20.1.1", location: "Blantyre Exchange", region: "South", status: "online", cpu: 45, memory: 60, bandwidth: "4.2 Gbps", lastChecked: "2 minutes ago", source: "Observium" },
  { hostname: "BLANTYRE-AGG-SW-02", type: "Switch", ip: "10.20.1.14", location: "Blantyre Exchange", region: "South", status: "warning", cpu: 78, memory: 71, bandwidth: "1.8 Gbps", lastChecked: "1 minute ago", source: "Observium" },
  { hostname: "LIMBE-EDGE-RTR-03", type: "Router", ip: "10.20.4.9", location: "Limbe POP", region: "South", status: "online", cpu: 33, memory: 48, bandwidth: "820 Mbps", lastChecked: "3 minutes ago", source: "SolarWinds" },
  { hostname: "LILONGWE-CORE-RTR-01", type: "Router", ip: "10.10.1.1", location: "Lilongwe HQ", region: "Central", status: "online", cpu: 52, memory: 64, bandwidth: "6.1 Gbps", lastChecked: "1 minute ago", source: "Observium" },
  { hostname: "LILONGWE-DC-FW-01", type: "Firewall", ip: "10.10.2.5", location: "Lilongwe Data Centre", region: "Central", status: "online", cpu: 41, memory: 57, bandwidth: "2.4 Gbps", lastChecked: "4 minutes ago", source: "SolarWinds" },
  { hostname: "LILONGWE-DC-SRV-07", type: "Server", ip: "10.10.2.71", location: "Lilongwe Data Centre", region: "Central", status: "warning", cpu: 86, memory: 82, bandwidth: "410 Mbps", lastChecked: "2 minutes ago", source: "SolarWinds" },
  { hostname: "ZOMBA-AGG-SW-05", type: "Switch", ip: "10.20.7.21", location: "Zomba POP", region: "South", status: "online", cpu: 29, memory: 44, bandwidth: "640 Mbps", lastChecked: "5 minutes ago", source: "Observium" },
  { hostname: "MZUZU-CORE-RTR-02", type: "Router", ip: "10.30.1.2", location: "Mzuzu Exchange", region: "North", status: "offline", cpu: 0, memory: 0, bandwidth: "0 Mbps", lastChecked: "12 minutes ago", source: "Observium" },
  { hostname: "MZUZU-EDGE-SW-08", type: "Switch", ip: "10.30.3.18", location: "Mzuzu POP", region: "North", status: "online", cpu: 37, memory: 51, bandwidth: "520 Mbps", lastChecked: "2 minutes ago", source: "Observium" },
  { hostname: "KASUNGU-EDGE-RTR-06", type: "Router", ip: "10.10.9.6", location: "Kasungu POP", region: "Central", status: "online", cpu: 24, memory: 39, bandwidth: "310 Mbps", lastChecked: "3 minutes ago", source: "SolarWinds" },
  { hostname: "MANGOCHI-EDGE-SW-11", type: "Switch", ip: "10.20.11.4", location: "Mangochi POP", region: "South", status: "warning", cpu: 69, memory: 74, bandwidth: "280 Mbps", lastChecked: "6 minutes ago", source: "Observium" },
  { hostname: "KARONGA-EDGE-RTR-09", type: "Router", ip: "10.30.8.3", location: "Karonga POP", region: "North", status: "online", cpu: 31, memory: 42, bandwidth: "190 Mbps", lastChecked: "4 minutes ago", source: "SolarWinds" },
];

export const trafficSeries = [
  { time: "00:00", internet: 210, backbone: 380, customer: 120 },
  { time: "02:00", internet: 165, backbone: 300, customer: 90 },
  { time: "04:00", internet: 140, backbone: 265, customer: 70 },
  { time: "06:00", internet: 205, backbone: 340, customer: 130 },
  { time: "08:00", internet: 340, backbone: 520, customer: 240 },
  { time: "10:00", internet: 430, backbone: 610, customer: 300 },
  { time: "12:00", internet: 450, backbone: 640, customer: 330 },
  { time: "14:00", internet: 415, backbone: 600, customer: 315 },
  { time: "16:00", internet: 438, backbone: 655, customer: 340 },
  { time: "18:00", internet: 470, backbone: 700, customer: 360 },
  { time: "20:00", internet: 495, backbone: 720, customer: 380 },
  { time: "22:00", internet: 360, backbone: 540, customer: 260 },
  { time: "24:00", internet: 250, backbone: 400, customer: 150 },
];

export const latencySeries = [
  { time: "10:00", latency: 12, loss: 0.1 },
  { time: "10:10", latency: 14, loss: 0.0 },
  { time: "10:20", latency: 11, loss: 0.2 },
  { time: "10:30", latency: 18, loss: 0.6 },
  { time: "10:40", latency: 26, loss: 1.4 },
  { time: "10:50", latency: 19, loss: 0.5 },
  { time: "11:00", latency: 13, loss: 0.1 },
  { time: "11:10", latency: 12, loss: 0.0 },
];

export const bandwidthGrowth = [
  { month: "Jan", peak: 3.1, average: 1.9 },
  { month: "Feb", peak: 3.4, average: 2.0 },
  { month: "Mar", peak: 3.8, average: 2.3 },
  { month: "Apr", peak: 4.1, average: 2.5 },
  { month: "May", peak: 4.6, average: 2.8 },
  { month: "Jun", peak: 5.0, average: 3.1 },
  { month: "Jul", peak: 5.4, average: 3.4 },
  { month: "Aug", peak: 6.1, average: 3.8 },
];

export const availabilityTrend = [
  { month: "Mar", south: 99.91, central: 99.96, north: 99.74 },
  { month: "Apr", south: 99.94, central: 99.97, north: 99.81 },
  { month: "May", south: 99.88, central: 99.95, north: 99.68 },
  { month: "Jun", south: 99.96, central: 99.98, north: 99.85 },
  { month: "Jul", south: 99.93, central: 99.97, north: 99.79 },
  { month: "Aug", south: 99.95, central: 99.99, north: 99.88 },
];

export const topLinks = [
  { name: "Blantyre Internet Link", capacity: "5 Gbps", utilisation: 90 },
  { name: "Lilongwe Backbone Link", capacity: "10 Gbps", utilisation: 82 },
  { name: "Blantyre – Zomba Fiber", capacity: "2 Gbps", utilisation: 74 },
  { name: "Lilongwe – Mzuzu Fiber", capacity: "2 Gbps", utilisation: 68 },
  { name: "Limbe Customer Aggregate", capacity: "1 Gbps", utilisation: 61 },
  { name: "Mangochi Access Ring", capacity: "1 Gbps", utilisation: 54 },
];

export type Alert = {
  id: string;
  device: string;
  issue: string;
  severity: Severity;
  time: string;
  status: "Open" | "Acknowledged" | "Resolved";
  engineer: string;
};

export const alerts: Alert[] = [
  { id: "ALR-4821", device: "BLANTYRE-CORE-RTR-01", issue: "Internet link utilisation above 90% threshold", severity: "critical", time: "10:45", status: "Open", engineer: "Unassigned" },
  { id: "ALR-4820", device: "MZUZU-CORE-RTR-02", issue: "Device unreachable — ICMP timeout via SNMP poller", severity: "critical", time: "10:32", status: "Acknowledged", engineer: "T. Banda" },
  { id: "ALR-4818", device: "LILONGWE-DC-SRV-07", issue: "Memory utilisation sustained above 80%", severity: "warning", time: "09:58", status: "Open", engineer: "Unassigned" },
  { id: "ALR-4816", device: "BLANTYRE-AGG-SW-02", issue: "Router CPU above threshold (78%)", severity: "warning", time: "09:30", status: "Acknowledged", engineer: "G. Phiri" },
  { id: "ALR-4813", device: "MANGOCHI-EDGE-SW-11", issue: "Interface Gi0/2 packet loss 1.4%", severity: "warning", time: "08:47", status: "Open", engineer: "Unassigned" },
  { id: "ALR-4809", device: "LIMBE-EDGE-RTR-03", issue: "Fiber link flap detected on Te0/1", severity: "info", time: "07:12", status: "Resolved", engineer: "C. Mvula" },
  { id: "ALR-4804", device: "ZOMBA-AGG-SW-05", issue: "Optical receive power degraded", severity: "warning", time: "06:05", status: "Resolved", engineer: "L. Chirwa" },
  { id: "ALR-4801", device: "LILONGWE-DC-FW-01", issue: "Configuration change detected outside change window", severity: "info", time: "05:40", status: "Resolved", engineer: "A. Nyirenda" },
];

export const generatedReports = [
  { name: "Daily Network Report — 07 Aug 2026", date: "07 Aug 2026 06:00", by: "Automation Scheduler", format: "PDF" },
  { name: "Weekly Performance Report — Wk 31", date: "04 Aug 2026 07:15", by: "G. Phiri", format: "Word" },
  { name: "Monthly SLA Report — July 2026", date: "01 Aug 2026 08:00", by: "Automation Scheduler", format: "PDF" },
  { name: "Incident Report — Mzuzu Core Outage", date: "29 Jul 2026 16:42", by: "T. Banda", format: "Word" },
  { name: "Daily Network Report — 06 Aug 2026", date: "06 Aug 2026 06:00", by: "Automation Scheduler", format: "PDF" },
  { name: "Monthly Management Report — July 2026", date: "01 Aug 2026 09:30", by: "A. Nyirenda", format: "PDF" },
];

export const users = [
  { name: "Alinafe Nyirenda", role: "Administrator", region: "Head Office", status: "Active", lastLogin: "Today 08:12" },
  { name: "Grace Phiri", role: "NOC Supervisor", region: "South Region", status: "Active", lastLogin: "Today 07:45" },
  { name: "Tawonga Banda", role: "NOC Engineer", region: "North Region", status: "Active", lastLogin: "Today 06:58" },
  { name: "Chimwemwe Mvula", role: "NOC Engineer", region: "South Region", status: "Active", lastLogin: "Yesterday 22:10" },
  { name: "Lucius Chirwa", role: "NOC Engineer", region: "Central Region", status: "Suspended", lastLogin: "02 Aug 2026 19:33" },
  { name: "Memory Kaunda", role: "NOC Supervisor", region: "Central Region", status: "Active", lastLogin: "Today 05:20" },
];

export const healthSegments = [
  { name: "Core Network", status: "healthy" as const, detail: "12 core nodes • 99.99% availability", metric: "99.99%" },
  { name: "Regional Network", status: "warning" as const, detail: "1 aggregation switch above CPU threshold", metric: "99.87%" },
  { name: "Customer Links", status: "healthy" as const, detail: "612 links polled • 3 in maintenance", metric: "99.94%" },
  { name: "Data Centre", status: "critical" as const, detail: "Mzuzu core router unreachable", metric: "98.42%" },
];

export const templateSections = [
  { title: "Executive Summary", detail: "Auto-generated narrative of monthly network posture, availability and major incidents." },
  { title: "Network Availability", detail: "Per-region availability table with SLA target comparison (Observium uptime data)." },
  { title: "Bandwidth Analysis", detail: "Peak and 95th percentile utilisation charts per core and customer link." },
  { title: "Incident Summary", detail: "Alert volume by severity, MTTR, and top recurring faults." },
  { title: "Recommendations", detail: "Automated capacity and remediation recommendations from trend analysis." },
];