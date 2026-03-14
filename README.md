# First Grade Literacy Companion

This application was built in 3 hours using Cursor as a demonstration for a Vibe and AI Programming class, serving as a practical example of AI-assisted full-stack development.

## Overview

First Grade Literacy Companion is a full-stack web application designed to assist teachers in motivating first-grade students to read more and engage with challenging vocabulary through gamification. The platform provides dedicated interfaces for school administrators, teachers, and students, with role-based access and a purpose-built literacy game.

## Features

### School Administrators
- View school-wide performance metrics across all classes and teachers
- Compare class performance using interactive charts (average score, reading time, completion rate, total sessions)
- Access a teacher leaderboard with ranking by student outcomes

### Teachers
- Manage multiple classes and student rosters
- Track per-student reading time, game scores, session history, and last active date
- Create and manage assignments with configurable game mode, difficulty material, target score, and due date
- Browse a curated materials library of word lists and reading passages

### Students (First Grade)
- No login required — students select their class and name from a visual roster
- Three game modes with animated, child-friendly interfaces and audio feedback
- Automatic assignment loading based on teacher configuration

## Game Modes

| Mode | Description |
|------|-------------|
| **Letters** | Students identify a displayed letter from four options. Advances to uppercase/lowercase matching in later rounds. |
| **Words** | Students match a sight word to its corresponding emoji illustration from four choices. |
| **Books** | Students read a short illustrated passage with highlighted vocabulary, then answer three comprehension questions. Includes text-to-speech for read-aloud support. |

All game modes include Web Audio API sound effects: a chime on correct answers, a buzz on incorrect answers, a fanfare on achieving three stars, and click feedback on all interactive elements.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), TypeScript |
| Database | PostgreSQL via Prisma ORM (v7) |
| Authentication | NextAuth.js v5 (credentials, JWT sessions) |
| UI Components | Tailwind CSS v4, shadcn/ui (@base-ui/react) |
| Animations | Framer Motion |
| Charts | Recharts |
| Audio | Web Speech API (TTS), Web Audio API (sound effects) |
| Database Adapter | @prisma/adapter-pg |

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A PostgreSQL database (local or hosted)

### Installation

```bash
npm install
```

### Environment Configuration

Edit `.env` in the project root:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

A hosted option such as [Neon](https://neon.tech) (free tier) works out of the box with no local Postgres installation required.

### Database Setup

```bash
npm run db:push     # Apply schema to database
npm run db:seed     # Populate with demo data
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| School Admin | admin@sunshine.edu | admin123 |
| Teacher | lahari@sunshine.edu | lahari123 |
| Teacher 2 | mr.smith@sunshine.edu | teacher123 |

## Application Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/login` | Staff authentication | Public |
| `/dashboard` | Teacher home, class overview | Teacher |
| `/dashboard/classes/[classId]` | Class detail, students, assignments | Teacher |
| `/dashboard/materials` | Materials library | Teacher |
| `/school` | School-wide analytics | School Admin |
| `/play` | Student play lobby | Public |
| `/play/game` | Live game session | Public |

## Database Scripts

```bash
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:migrate    # Run migrations (production)
npm run db:push       # Push schema directly (development)
npm run db:seed       # Seed demo data
npm run db:studio     # Open Prisma Studio visual database browser
```
