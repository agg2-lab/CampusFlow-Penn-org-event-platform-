# CampusFlow

**The all-in-one platform for Penn student organizations.** Create events, sell tickets, manage check-in, and engage your community.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌───────────────┐
│   Next.js    │────▶│   Express    │────▶│  MongoDB      │
│   Frontend   │     │   Backend    │     │  (events,     │
│   (React,    │     │   (REST API, │     │   check-ins,  │
│   Tailwind)  │     │   Socket.io) │     │   analytics)  │
└──────┬───────┘     └──────┬───────┘     └───────────────┘
       │                    │
       │                    │             ┌───────────────┐
       │                    └────────────▶│  MySQL        │
       │                    │             │  (users, orgs,│
       │                    │             │   memberships,│
       │                    │             │   tickets)    │
       │                    │             └───────────────┘
       │                    │
       │                    │             ┌───────────────┐
       │                    └────────────▶│  Redis        │
       │                                  │  (sessions,   │
       │                                  │   pub/sub)    │
  ┌────▼────┐                             └───────────────┘
  │  Nginx  │
  │  (proxy,│
  │   CDN)  │
  └─────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Express.js, TypeScript, Socket.io |
| SQL DB | MySQL 8 (users, orgs, memberships, tickets) |
| NoSQL DB | MongoDB 7 (events, check-ins, analytics) |
| Cache | Redis 7 (sessions, real-time pub/sub) |
| Auth | JWT, Google OAuth, Email Magic Links |
| QR | `qrcode` generation + BarcodeDetector API scanning |
| Charts | Recharts |
| Infra | Docker, Nginx, AWS ECS Fargate, CloudFront CDN |

## Features

### 1. Auth & Roles
- Email + password registration
- Google OAuth (one-click sign-in)
- Email magic links (passwordless)
- Role-based access: **Admin**, **Officer**, **Member** per org

### 2. Event Management
- Create events with title, description, dates, location, tags, capacity
- Ticket pricing (free or paid)
- RSVP with auto-generated QR code tickets
- Virtual/hybrid event support
- Full-text search + tag/date filters
- Personalized "Recommended Events" feed

### 3. Real-Time Check-In
- Webcam QR code scanning (BarcodeDetector API)
- Manual check-in fallback
- Live check-in feed via Socket.io
- Duplicate/invalid ticket detection

### 4. Analytics Dashboard
- Org-level KPIs: events, RSVPs, check-ins, revenue, members
- Event-level breakdown: attendance funnel, ticket status, hourly timeline
- Attendance trends over last 30 days
- Drop-off rate and conversion tracking

### 5. AWS Deployment
- Docker containers for frontend + backend
- ECS Fargate for container orchestration
- CloudFront CDN for static asset caching
- CloudFormation IaC template included
- ALB with path-based routing (`/api/*` → backend, `/*` → frontend)

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Development (Docker)

```bash
# Clone and start all services
cp .env.example .env  # edit with your credentials
docker-compose up -d

# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
# Nginx:    http://localhost:80
```

### Development (Local)

```bash
# Backend
cd backend
npm install
npm run dev    # http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev    # http://localhost:3000
```

### Deploy to AWS

```bash
# 1. Deploy infrastructure
aws cloudformation deploy \
  --template-file aws/cloudformation.yml \
  --stack-name campusflow \
  --capabilities CAPABILITY_IAM

# 2. Build and push containers
chmod +x aws/deploy.sh
./aws/deploy.sh
```

## Project Structure

```
Campus/
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── config/           # DB connections, env, Redis
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # Auth, role checks
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Email, QR generation
│   │   ├── utils/            # JWT, slugs
│   │   └── index.ts          # Server entry + Socket.io
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # Next.js App Router
│   ├── src/
│   │   ├── app/              # Pages (App Router)
│   │   │   ├── (auth)/       # Login, Register
│   │   │   ├── events/       # List, Detail, Create
│   │   │   ├── orgs/         # List, Detail, Create
│   │   │   ├── checkin/      # QR scanner + check-in log
│   │   │   ├── dashboard/    # Org dashboard
│   │   │   ├── admin/        # Analytics dashboard
│   │   │   └── page.tsx      # Landing page
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Zustand auth store
│   │   ├── lib/              # API client, utilities
│   │   └── types/            # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
│
├── nginx/                    # Reverse proxy config
├── aws/                      # CloudFormation + deploy script
├── docker-compose.yml        # Full stack orchestration
└── .env.example              # Environment template
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/magic-link` | Send magic link email |
| GET | `/api/auth/magic` | Verify magic link |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/events` | List events (search, filter, paginate) |
| GET | `/api/events/recommended` | Personalized event feed |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events` | Create event |
| POST | `/api/events/:id/rsvp` | RSVP / get ticket |
| GET | `/api/orgs` | List organizations |
| GET | `/api/orgs/mine` | User's organizations |
| POST | `/api/orgs` | Create organization |
| POST | `/api/checkin/qr` | Check in via QR code |
| POST | `/api/checkin/manual` | Manual check-in |
| GET | `/api/checkin/event/:id` | Check-in list |
| GET | `/api/analytics/org/:id/dashboard` | Org analytics |
| GET | `/api/analytics/event/:id` | Event analytics |
| GET | `/api/analytics/org/:id/trends` | Attendance trends |

## License

Open

