# CampusFlow
Submitted by: Adam Haney

CampusFlow is an all-in-one platform for Penn student organizations to create events, manage RSVPs/tickets, run real-time QR check-in, and track engagement with analytics.

Time spent: __ hours spent in total

---

## Required Features
The following required functionality is completed:

- [x] User authentication (email/password)
- [x] Organization creation + membership model
- [x] Role-based access control per org (Admin / Officer / Member)
- [x] Create events (title, description, date/time, location, tags, capacity)
- [x] Event listing with pagination
- [x] Full-text search + filters (tag/date)
- [x] RSVP / ticket generation with unique QR code per attendee
- [x] QR code check-in + invalid/duplicate detection
- [x] Real-time check-in feed (Socket.io)
- [x] Analytics dashboard (org KPIs + event breakdown)

---

## Optional Features
The following optional features are implemented:

- [x] Google OAuth (one-click sign-in)
- [x] Email magic links (passwordless sign-in)
- [x] Manual check-in fallback
- [x] Personalized “Recommended Events” feed
- [x] Attendance trends over the last 30 days
- [x] Hourly check-in timeline + funnel metrics (RSVP → check-in)

---

## Additional Features
The following additional features are implemented:

- [x] Hybrid persistence layer:
  - MySQL (users, orgs, memberships, tickets)
  - MongoDB (events, check-ins, analytics)
- [x] Redis for sessions + real-time pub/sub
- [x] Nginx reverse proxy with path-based routing (/api/* → backend, /* → frontend)
- [x] Dockerized full stack via Docker Compose (local dev)
- [x] AWS deployment setup (ECS Fargate + CloudFront CDN + ALB routing)
- [x] Dashboard visualizations using Recharts

---

## Video Walkthrough

### Authentication
**Google OAuth / Email Magic Link Login**  
gif-here

### Event Management
**Creating an Event + RSVP Ticket Generation**  
gif-here

### Real-Time Check-In
**Webcam QR Scanning + Live Check-In Feed**  
gif-here

### Analytics Dashboard
**Org KPIs + Event Funnel + Trends**  
gif-here

GIF created with LICEcap...

---

## Check out the website live
(Add your deployed URL here)

---

## Notes
Challenges encountered while building the app:

One major challenge was designing a clean data model across both SQL and NoSQL while keeping the API straightforward. I used MySQL for relational entities like users/orgs/memberships/tickets, and MongoDB for event/check-in/analytics data where flexible schemas and aggregation are helpful.

Another challenge was building reliable QR check-in with real-time updates. The workflow needed to handle duplicate scans, invalid tickets, and live visibility for org staff, so Socket.io was used to stream check-in events while Redis supported session and pub/sub patterns.

Deployment and local orchestration were also key considerations. Docker Compose made it easy to run the full stack locally, while the AWS setup is structured around ECS Fargate + CloudFront and Nginx/ALB routing for a production-style architecture.

---
