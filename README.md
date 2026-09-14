# Network Watch

Design a complete web-based Network Operations Center (NOC) Automation and Reporting System called:

"Automated Network Performance Monitoring & Reporting System (ANPMRS)"

The system is designed for a NOC department. It should be a professional enterprise monitoring platform that automatically collects network performance data from monitoring tools such as Observium and SolarWinds, analyzes network health, generates reports, and helps NOC engineers monitor the entire network infrastructure.

The design should look like a modern telecommunications company application. The theme must follow MTL branding:

Primary colors:

- Blue (#1E1E8C): main navigation, headers, buttons

- Yellow (#FFE600): highlights, alerts, important statistics

- White (#FFFFFF): background and clean spaces

- Light grey: cards and secondary sections

The overall design style should be:

- Professional

- Enterprise-grade

- Clean

- Modern dashboard style

- Similar to network monitoring platforms used by telecom companies

- Responsive for desktop screens used by NOC engineers

==================================================

SYSTEM PURPOSE

==================================================

The system should automate the process of:

1. Collecting network information from:

   - Observium

   - SolarWinds

   - Network devices through SNMP and SSH

2. Monitoring:

   - Router health

   - Switch health

   - Fiber links

   - Bandwidth utilization

   - Interface traffic

   - CPU usage

   - Memory usage

   - Device availability

   - Packet loss

   - Latency

   - Network alerts

3. Automatically generating:

   - Daily reports

   - Weekly reports

   - Monthly management reports

   - SLA performance reports

4. Providing:

   - Real-time dashboards

   - Historical trends

   - Automated recommendations

   - Network performance analysis

==================================================

MAIN APPLICATION STRUCTURE

==================================================

Create the following pages:

1. LOGIN PAGE

2. MAIN DASHBOARD

3. NETWORK DEVICES PAGE

4. LIVE MONITORING PAGE

5. ALERT MANAGEMENT PAGE

6. REPORT GENERATION PAGE

7. REPORT TEMPLATE MANAGEMENT PAGE

8. ANALYTICS AND TRENDS PAGE

9. USER MANAGEMENT PAGE

10. SYSTEM SETTINGS PAGE

==================================================

1. LOGIN PAGE DESIGN

==================================================

Create a professional login screen.

Layout:

Center a login card.

Top:

- MTL logo placeholder

- System name:

"Automated Network Performance Monitoring System"

Fields:

- Username

- Password

Buttons:

- Login

Additional:

- Forgot password link

Background:

Use a subtle telecom/network background showing:

- Fiber cables

- Network connections

- Data flow lines

Colors:

Blue and white with yellow highlights.

==================================================

2. MAIN DASHBOARD DESIGN

==================================================

The dashboard is the most important page.

Layout:

LEFT SIDEBAR NAVIGATION:

Top:

MTL logo

Menu items:

Dashboard

Network Devices

Live Monitoring

Alerts

Reports

Analytics

Users

Settings

Bottom:

Logged-in user profile

Example:

"NOC Engineer

South Region"

==================================================

TOP HEADER:

Left:

Page title:

"Network Operations Dashboard"

Right:

- Search bar

- Notification bell

- User profile

==================================================

DASHBOARD CONTENT:

Create summary statistic cards.

Row 1:

Card 1:

TOTAL DEVICES

Example:

850

Status:

820 Online

30 Offline

Card 2:

NETWORK AVAILABILITY

Example:

99.95%

Use circular percentage indicator.

Card 3:

ACTIVE ALERTS

Example:

12 Alerts

Yellow/red warning indicator.

Card 4:

REPORTS GENERATED

Example:

45 Reports

==================================================

NETWORK HEALTH SECTION

Create a large monitoring panel.

Display:

Overall Network Status:

Green:

Healthy

Yellow:

Warning

Red:

Critical

Show:

Core Network

Regional Network

Customer Links

Data Centre

Each should have status indicators.

==================================================

TRAFFIC MONITORING GRAPH

Create a large line graph.

Title:

"Bandwidth Utilization Overview"

Graph should display:

Time:

00:00 - 24:00

Values:

Mbps/Gbps usage

Example:

Internet Link:

450 Mbps

Peak:

90%

==================================================

DEVICE STATUS TABLE

Create table:

Columns:

Device Name

Location

IP Address

Status

CPU Usage

Memory

Last Checked

Example:

BLANTYRE-CORE-RTR

South Region

192.168.x.x

ONLINE

45%

60%

2 minutes ago

Status icons:

Green circle:

Online

Yellow:

Warning

Red:

Offline

==================================================

RECENT ALERTS PANEL

Create card:

Title:

"Recent Network Alerts"

Example:

Critical:

Internet Link High Utilization

Time:

10:45

Warning:

Router CPU Above Threshold

Time:

09:30

==================================================

3. NETWORK DEVICES PAGE

==================================================

Design a device management page.

Include:

Search bar:

"Search device by hostname/IP"

Filters:

Region:

- South

- Central

- North

Device Type:

- Router

- Switch

- Firewall

- Server

Create device cards.

Each card displays:

Hostname

Device Type

IP Address

Location

Status

CPU

Memory

Bandwidth

==================================================

4. LIVE MONITORING PAGE

==================================================

Create a real-time monitoring interface.

Display:

Large network topology map.

Show:

MTL Core Network

      |

Regional Nodes

      |

Customer Connections

Use animated connection lines.

Each device should have:

Green:

Normal

Yellow:

Warning

Red:

Failure

Include:

Live traffic graphs

Latency graphs

Packet loss graphs

==================================================

5. ALERT MANAGEMENT PAGE

==================================================

Create an alert center.

Sections:

Critical Alerts

Warnings

Resolved Alerts

Table:

Alert ID

Device

Issue

Severity

Time

Status

Assigned Engineer

Include buttons:

Acknowledge

Assign

Resolve

==================================================

6. REPORT GENERATION PAGE

==================================================

Create a professional report management interface.

Top section:

Generate New Report

Options:

Report Type:

Daily Network Report

Weekly Performance Report

Monthly SLA Report

Incident Report

Select:

Region

Date Range

Devices

Button:

Generate Report

==================================================

Below:

Generated Reports Table

Report Name

Date

Created By

Format

Download

Formats:

PDF

Word

==================================================

7. REPORT TEMPLATE MANAGEMENT PAGE

==================================================

Create interface where administrators design report templates.

Show:

MTL Monthly Network Performance Report

Sections:

Executive Summary

Network Availability

Bandwidth Analysis

Incident Summary

Recommendations

Allow:

Add Section

Edit Template

Save Template

==================================================

8. ANALYTICS PAGE

==================================================

Create analytics dashboard.

Include:

Bandwidth Growth Trend

Line chart

Device Availability Trend

Bar chart

Top Utilized Links

Ranking list

Example:

1.

Blantyre Internet Link

90%

2.

Lilongwe Backbone Link

82%

==================================================

9. USER MANAGEMENT PAGE

==================================================

Create user administration page.

Table:

Name

Role

Region

Status

Last Login

Roles:

Administrator

NOC Supervisor

NOC Engineer

==================================================

10. SYSTEM SETTINGS PAGE

==================================================

Include:

Monitoring Connections:

Observium API

SolarWinds API

SNMP Configuration

Report Settings

Email Notification Settings

Security Settings

==================================================

ADDITIONAL DESIGN REQUIREMENTS

==================================================

Include:

- Professional telecom icons

- Network diagrams

- Graphs

- Status indicators

- Tables

- Cards

- Charts

The interface should feel like software used by a real telecommunications NOC.

The design should emphasize:

1. Network visibility

2. Automation

3. Reporting

4. SLA monitoring

5. Fault detection

6. Documentation

7. Audit readiness

The final output should be a complete high-fidelity UI/UX design prototype for a telecom network monitoring and automated reporting platform.

**Live app**: https://mtl-netwatch-hub.lovable.app

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
