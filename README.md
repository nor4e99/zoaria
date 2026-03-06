# 🐾 ZOARIA — Veterinary SaaS Platform

Full-stack veterinary platform: Django backend + Next.js frontend.  
Track pet health, book vet appointments, real-time chat, automated reminders.

---

## Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Backend      | Django 5 + DRF + Channels (WebSocket) + Daphne  |
| Task queue   | Celery + django-celery-beat + Redis             |
| Database     | PostgreSQL 16                                   |
| File storage | Cloudinary                                      |
| Payments     | Stripe                                          |
| Frontend     | Next.js 14 (App Router) + TypeScript + Tailwind |
| State        | Zustand + TanStack Query                        |
| Deploy       | Railway (backend) + Vercel (frontend)           |

---

## Project Structure

```
zoaria/
├── backend/
│   ├── apps/
│   │   ├── users/          Auth, JWT, email verification, profiles
│   │   ├── vets/           Vet profiles, reviews, approval workflow
│   │   ├── pets/           Pet CRUD, species/breeds, BMI, RER/MER
│   │   ├── health/         Medical records, prescriptions
│   │   ├── feeding/        Feeding logs, guidelines, calorie tracking
│   │   ├── activity/       Activity logs, GPS fields, stats endpoint
│   │   ├── calendar_app/   Appointments, reminders (repeating)
│   │   ├── chat/           WebSocket conversations + file attachments
│   │   ├── payments/       Stripe subscriptions + webhook handler
│   │   ├── notifications/  In-app notifications
│   │   ├── hub/            Educational articles + videos
│   │   ├── admin_panel/    Admin API (vet approval, analytics)
│   │   ├── uploads/        Cloudinary: pet photos, vet licenses, attachments
│   │   └── tasks/          Celery: reminders, appointment alerts, digests
│   ├── config/
│   │   ├── settings/       base / development / production
│   │   ├── celery.py       Beat schedule (daily/hourly/weekly tasks)
│   │   ├── asgi.py         Channels routing
│   │   └── urls.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── DEPLOYMENT.md       Full Railway + Vercel deployment guide
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/         login, register, verify-email, forgot-password
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/  Overview, pets summary, reminders
│   │   │   ├── pets/       Pet list, detail, 3-step creation wizard
│   │   │   ├── find-vet/   Vet directory with search + ratings
│   │   │   ├── messages/   Chat list + WebSocket chat room
│   │   │   ├── appointments/ Calendar + booking modal
│   │   │   ├── notifications/ Grouped notification list
│   │   │   ├── hub/        Articles + videos with language filter
│   │   │   ├── account/    Profile, subscription, password
│   │   │   ├── vet/        Vet dashboard (profile, pending appts)
│   │   │   └── admin/      Analytics, vet approvals, user management
│   │   └── (public)/       Landing page
│   ├── components/
│   │   ├── layout/         Navbar (role-aware + mobile bottom nav)
│   │   ├── pets/           BMIIndicator (SVG gauge), PetCreateForm
│   │   └── ui/             Toaster
│   ├── store/              Zustand: authStore, notificationStore
│   ├── hooks/              useTranslation (EN/BG), useAuth
│   ├── lib/                api.ts (Axios + JWT refresh), utils.ts
│   ├── i18n/               en.json, bg.json
│   └── Dockerfile
│
├── docker-compose.yml      Full local stack (6 services)
└── railway.toml            Railway deployment config
```

---

## Quick Start (Docker — recommended)

### 1. Clone & configure

```bash
git clone <your-repo-url>
cd zoaria

# Create backend env file
cp backend/.env.example backend/.env
# Edit backend/.env — at minimum set EMAIL_*, CLOUDINARY_URL, STRIPE_* keys
# (see backend/.env.example for all options)
```

### 2. Start everything

```bash
docker compose up --build
```

This starts 6 services in order:
1. **PostgreSQL** — waits for health check
2. **Redis** — waits for health check
3. **Backend** — runs `setup_zoaria` (migrate + seed + register beat tasks), then Daphne
4. **Celery worker** — processes async tasks (emails, uploads)
5. **Celery beat** — fires scheduled tasks (daily/weekly)
6. **Frontend** — Next.js dev server

### 3. Open

| Service        | URL                              |
|----------------|----------------------------------|
| Frontend       | http://localhost:3000            |
| Backend API    | http://localhost:8000/api/       |
| Django Admin   | http://localhost:8000/django-admin/ |

### 4. Create your first admin user

```bash
docker compose exec backend python manage.py createsuperuser
```

---

## Manual Setup (without Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env

export DJANGO_SETTINGS_MODULE=config.settings.development
python manage.py setup_zoaria      # migrate + seed + register beat tasks
python manage.py createsuperuser
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

Start Celery (separate terminals):

```bash
celery -A config worker --loglevel=info
celery -A config beat   --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Set: NEXT_PUBLIC_API_URL=http://localhost:8000/api
#      NEXT_PUBLIC_WS_URL=ws://localhost:8000

npm install
npm run dev
```

---

## Key Features

### Pet Health Tracking
- Full pet profiles with species/breed database (dogs, cats, horses, rabbits, guinea pigs, birds, exotic)
- **BMI gauge** — animated SVG needle showing underweight/healthy/overweight based on breed weight ranges
- RER (Resting Energy Requirement) and MER (Maintenance Energy Requirement) calculated per pet
- Medical records, prescriptions, feeding logs, activity logs with GPS support

### Veterinarian System
- Vets register and upload license documents
- Admin approval workflow before vet appears in directory
- Star ratings and reviews from pet owners
- Real-time consultation pricing display

### Appointments & Reminders
- Book appointments with any approved vet
- Reminder system: vaccination, deworming, medication, custom — all support repeat intervals
- **Automated emails**: due reminders fire daily, appointment alerts 24 h before, weekly digest every Monday

### Real-time Chat
- WebSocket-based conversations between owners and vets
- File attachment support (via Cloudinary)
- Typing indicators

### Subscriptions
- Basic (free) — 1 pet
- Standard (€9.99/mo) — 2 pets + priority support
- Premium (€19.99/mo) — unlimited pets + chat + GPS
- Stripe Checkout integration with webhook handler

### Admin Panel
- Vet approval queue with license document review
- User management with activate/deactivate
- Analytics dashboard (users, vets, revenue, subscription distribution)

### Internationalisation
- Full EN/BG translation (i18n)
- Language switcher in navbar persisted via Zustand

---

## Environment Variables

See `backend/.env.example` for the full list. Key ones:

```env
SECRET_KEY=...
DATABASE_URL=postgresql://...      # or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD
REDIS_URL=redis://...
CLOUDINARY_URL=cloudinary://...
STRIPE_SECRET_KEY=sk_...
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
FRONTEND_URL=https://...
```

---

## Deployment

See `backend/DEPLOYMENT.md` for the complete step-by-step guide covering:
- Railway project setup (web + Celery worker + Celery beat as 3 separate services)
- PostgreSQL and Redis plugins
- Vercel frontend deployment
- Cloudinary, Stripe, Gmail setup
- Production checklist

---

## API Overview

| Prefix                | App              |
|-----------------------|------------------|
| `/api/auth/`          | Auth, JWT, users |
| `/api/pets/`          | Pets, species, breeds |
| `/api/vets/`          | Vet profiles, reviews |
| `/api/health/`        | Medical records, prescriptions |
| `/api/feeding/`       | Feeding logs, guidelines |
| `/api/activity/`      | Activity logs, stats |
| `/api/calendar/`      | Appointments, reminders |
| `/api/chat/`          | Conversations, messages |
| `/api/payments/`      | Subscriptions, Stripe webhook |
| `/api/notifications/` | In-app notifications |
| `/api/hub/`           | Articles, videos |
| `/api/uploads/`       | Cloudinary uploads |
| `/api/admin-panel/`   | Admin: vets, users, analytics |
| `ws://…/ws/chat/<id>/` | WebSocket chat |

---

## Testing Celery Tasks Manually

```bash
# In Django shell
python manage.py shell

from apps.tasks.reminders import send_due_reminders, send_appointment_reminders, send_weekly_digest

send_due_reminders.apply()          # Test daily reminder
send_appointment_reminders.apply()  # Test appointment 24h alert
send_weekly_digest.apply()          # Test Monday digest
```

