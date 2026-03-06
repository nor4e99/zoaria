# ZOARIA — Phase 5 Deployment Guide
# Railway (Backend) + Vercel (Frontend) + Cloudinary + Stripe

---

## Architecture Overview

```
Browser  ──►  Vercel (Next.js frontend)
                │
                ├── REST API  ──►  Railway Web Service (Django/Daphne)
                └── WebSocket ──►  Railway Web Service (Django Channels)
                                        │
                                   Railway PostgreSQL
                                   Railway Redis
                                   Cloudinary (media files)
                                   Stripe (payments)
                                   Gmail SMTP (emails)
```

---

## 1. Prerequisites

- Railway account: https://railway.app
- Vercel account: https://vercel.com
- Cloudinary account: https://cloudinary.com (free tier is fine)
- Stripe account: https://stripe.com
- Gmail account with App Password enabled

---

## 2. Backend — Railway Deployment

### 2.1 Create Railway Project

1. Go to https://railway.app → New Project → Deploy from GitHub Repo
2. Connect your GitHub repo, select the `/backend` folder as root
3. Railway auto-detects Python and uses the Dockerfile

### 2.2 Add PostgreSQL

1. In your Railway project → New Service → Database → PostgreSQL
2. Railway automatically sets `DATABASE_URL` in your environment
3. No manual config needed — the settings already handle `DATABASE_URL`

### 2.3 Add Redis

1. In your Railway project → New Service → Database → Redis
2. Railway automatically sets `REDIS_URL`
3. Same — settings already handle it

### 2.4 Set Environment Variables

In Railway → your web service → Variables, add:

```
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
ALLOWED_HOSTS=<your-service>.railway.app
CORS_ALLOWED_ORIGINS=https://<your-frontend>.vercel.app
FRONTEND_URL=https://<your-frontend>.vercel.app

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-app@gmail.com
EMAIL_HOST_PASSWORD=<gmail-app-password>

# Cloudinary
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STANDARD_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
```

### 2.5 Celery Worker Service

1. In your Railway project → New Service → GitHub Repo (same repo)
2. Set Start Command: `celery -A config worker --loglevel=info --concurrency=2`
3. Add the same environment variables as the web service
4. This service handles all async tasks (emails, etc.)

### 2.6 Celery Beat Service (Scheduler)

1. New Service → GitHub Repo (same repo again)
2. Set Start Command: `celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler`
3. Same environment variables
4. This fires the periodic tasks (daily reminders, weekly digest)

### 2.7 Run Migrations

In Railway → Web Service → Shell (or via CLI):

```bash
python manage.py migrate
python manage.py seed_db
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

Or add a release command in railway.toml:

```toml
[deploy]
releaseCommand = "python manage.py migrate && python manage.py collectstatic --noinput"
startCommand = "daphne -b 0.0.0.0 -p $PORT config.asgi:application"
```

### 2.8 Custom Domain (optional)

Railway → Settings → Domains → Add Custom Domain
Then add a CNAME record in your DNS: `api.yourdomain.com → your-service.railway.app`

---

## 3. Frontend — Vercel Deployment

### 3.1 Deploy to Vercel

1. Go to https://vercel.com → New Project → Import from GitHub
2. Select the repo, set **Root Directory** to `frontend`
3. Framework: Next.js (auto-detected)

### 3.2 Environment Variables in Vercel

Go to Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://<your-backend>.railway.app/api
NEXT_PUBLIC_WS_URL=wss://<your-backend>.railway.app
```

### 3.3 Update next.config.js for production

The `next.config.js` already has rewrites for `/api/:path*`.
In production you don't need the rewrite — the frontend calls the Railway URL directly.
Set the env vars above and Next.js will use them.

### 3.4 Custom Domain (optional)

Vercel → Settings → Domains → Add Domain
Then update your DNS: `yourdomain.com → cname.vercel-dns.com`

---

## 4. Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Dashboard → API Keys → Copy your `Cloud Name`, `API Key`, `API Secret`
3. Format: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
4. Paste as `CLOUDINARY_URL` in Railway env vars

Cloudinary folders created automatically by ZOARIA:
- `zoaria/pets/` — pet profile photos (auto-cropped 800×800)
- `zoaria/vet_licenses/` — vet license documents
- `zoaria/attachments/` — chat file attachments

---

## 5. Stripe Setup

### 5.1 Create Products & Prices

1. Stripe Dashboard → Products → Add Product
2. Create **ZOARIA Standard** — €9.99/month recurring → copy Price ID
3. Create **ZOARIA Premium** — €19.99/month recurring → copy Price ID
4. Add both Price IDs to Railway env vars

### 5.2 Configure Webhook

1. Stripe Dashboard → Developers → Webhooks → Add Endpoint
2. URL: `https://<your-backend>.railway.app/api/payments/webhook/`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the Signing Secret → add as `STRIPE_WEBHOOK_SECRET` in Railway

### 5.3 Test Mode First

Keep `STRIPE_SECRET_KEY=sk_test_...` until you're ready to go live.
Use Stripe test card: `4242 4242 4242 4242`, any future date, any CVC.

---

## 6. Gmail App Password Setup

1. Google Account → Security → 2-Step Verification (must be ON)
2. Security → App Passwords → Select app: Mail, device: Other → type "ZOARIA"
3. Copy the 16-character password → use as `EMAIL_HOST_PASSWORD`

---

## 7. Local Development

```bash
# Clone and setup
git clone <repo>
cd zoaria/backend

# Copy env
cp .env.example .env
# Edit .env with your dev values

# Start all services with Docker Compose
docker compose up -d

# First-time setup
docker compose exec web python manage.py migrate
docker compose exec web python manage.py seed_db
docker compose exec web python manage.py createsuperuser

# Frontend
cd ../frontend
cp .env.example .env.local
# Set: NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm install
npm run dev
```

Backend at: http://localhost:8000
Frontend at: http://localhost:3000
Django Admin: http://localhost:8000/django-admin/

---

## 8. Manually Trigger Celery Tasks (testing)

```bash
# In Django shell
python manage.py shell

from apps.tasks.reminders import send_due_reminders, send_appointment_reminders, send_weekly_digest

# Test each task synchronously
send_due_reminders.apply()
send_appointment_reminders.apply()
send_weekly_digest.apply()
```

Or via Celery:
```bash
celery -A config call apps.tasks.reminders.send_due_reminders
```

---

## 9. Monitoring

- Railway provides built-in logs for all services
- Django Admin: `/django-admin/` — manage users, pets, subscriptions
- Django Admin → Periodic Tasks — manage Celery beat schedules
- Cloudinary Dashboard — monitor upload usage/bandwidth
- Stripe Dashboard — monitor payments, subscriptions, webhook delivery

---

## 10. Production Checklist

Before going live:

- [ ] SECRET_KEY is a 50+ character random string
- [ ] DEBUG=False
- [ ] ALLOWED_HOSTS contains only your actual domains
- [ ] CORS_ALLOWED_ORIGINS contains only your frontend URL
- [ ] Stripe switched to live keys (sk_live_...)
- [ ] Stripe webhook URL updated to production backend URL
- [ ] Cloudinary URL set
- [ ] Gmail App Password set
- [ ] All migrations applied (`python manage.py migrate`)
- [ ] Database seeded (`python manage.py seed_db`)
- [ ] Superuser created (`python manage.py createsuperuser`)
- [ ] Celery worker service running on Railway
- [ ] Celery beat service running on Railway
- [ ] Static files collected (handled by Dockerfile)
- [ ] HTTPS enforced (Railway provides SSL automatically)
- [ ] Frontend NEXT_PUBLIC_API_URL points to production backend
- [ ] Frontend NEXT_PUBLIC_WS_URL uses `wss://` (not `ws://`)
