# The SIM Website (Studio for Interrelated Media)

This is the official platform for the **Studio for Interrelated Media (SIM)** program at MassArt. It serves as a digital directory, a collaborative calendar for Thursday class meetings, and an academic record-keeping system for faculty to track student progress.

---

## Setting up your developer environment.

Follow these steps to get your local environment running:

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js 20+**
- **npm** (The project uses `package-lock.json`)
- **PostgreSQL 14+**

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/EfeOzalpp/sim-portal.git
cd sim-portal

# Install dependencies
npm install
```

### 3. Automated Setup

To configure your .env and database quickly, run the interactive setup script:

```bash
npm run setup
```

**What does `setup.ts` do?**

1. Creates your `.env` file from the template `.env.example`
2. Generates a unique `NEXTAUTH_SECRET` automatically.
3. Prompts for Google OAuth credentials and tests your PostgreSQL connection.
4. Automatically synchronizes the database schema and seeds your first admin user and semester.

### 4. Launch

```bash
npm run dev
```

Access the app at [http://localhost:3000](http://localhost:3000).

### Video demo database

The recording dataset uses a separate PostgreSQL database named `sim_video`.
Its seed has two hard guards: `DATABASE_URL` must end in `/sim_video`, and
`ALLOW_VIDEO_SEED` must be `true`.

1. Copy `.env.video.example` to `.env.video` and fill in the recording account
   and OAuth values. The real `.env.video` file is ignored by Git.
2. Apply the schema with `npm run db:push:video`.
3. Create or reset the 75 fictional profiles with `npm run db:seed:video`.
4. Start the isolated recording app with `npm run dev:video`.

The video seed creates 67 students, 5 staff, and 3 admins distributed across
ten mock semesters from `SP22` through `FA26`. Never use the regular
`npm run db:seed` command for the recording database.

---

## Project Anatomy

The codebase follows modern Next.js patterns, separating concerns between data mutation, UI components, and routing.

### `src/` Directory Breakdown

- **`actions/`**: Contains Next.js Server Actions for all database mutations. This is where business logic for creating users, updating semesters, and managing "Thursdays" lives.
- **`app/`**: The pages of the website
  - `admin/`: Restricted tools for faculty management.
  - `thursdays/`: The central calendar system.
  - `users/`: Student/Faculty directory.
- **`components/`**: The user interface elements that make up the pages.
  - `domain/`: Components tied to specific data types (e.g., a "User Card").
  - `forms/`: Complex input logic handled with `react-hook-form` and `zod`.
  - `ui/`: Design system primitives (built on top of `Ant Design`).
- **`hooks/`**: Shared client-side behavior, such as `useURLFilter` for real-time dashboard filtering.
- **`setup.ts`**: A dedicated utility to bridge the gap between a fresh clone and a working development environment.

### Database Architecture

- **Prisma**: Used as the ORM. The schema is defined in `database/schema.prisma`.
- **Seeding**: `database/seed.ts` programmatically generates the "Thursday" schedule based on your semester start/end dates, ensuring you don't have to manually create 15+ calendar entries every term.

---

## Maintenance & Production

### Deployment Workflow

For production environments (e.g., Ubuntu 24+ with Nginx):

```bash
# Update and build
git pull
npm install
npx prisma migrate deploy
npx prisma generate
npm run build

# Restart the service
pm2 restart massartsim
```

### Process Management

The application uses **PM2** for process management.

- **Check Status**: `pm2 list`
- **View Logs**: `pm2 logs massartsim --lines 50`
- **Environment Updates**: `pm2 restart massartsim --update-env`

### Database Backups

Always back up the database before manual edits or migrations:

```bash
pg_dump -U sim sim > backup_$(date +%Y%m%d).sql
```

---

## Faculty Guide

### Managing Users

- **Authentication**: Users log in via Google. Security is handled via **whitelisting**. An admin must add a user's email to the system before they can log in.
- **Profiles**: Every user requires a name, pronouns, and a face photo for the directory.

### Managing Semesters & Thursdays

1. **Create a Semester**: Set the name (e.g., "FA26") and the date range.
2. **Automated Generation**: The system automatically calculates every Thursday in that range.
3. **Production Days**:
   - **Big Production**: Defaults to a "Pozen Center" location.
   - **Small Production**: Standard classroom presentations.
4. **Student Progress**: The Admin Dashboard automatically tallies "Works Made" and "Groups Produced" for every student in a given semester, simplifying end-of-term grading.

---

_For technical issues, contact the system administrator or refer to the `setup.ts` logic._
