"""
ZOARIA Celery Configuration
"""
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

app = Celery('zoaria')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# ─── Periodic task schedule (django-celery-beat) ──────────────────────────────
app.conf.beat_schedule = {
    # Run every morning at 08:00 UTC — send due reminders
    'send-due-reminders-daily': {
        'task': 'apps.tasks.reminders.send_due_reminders',
        'schedule': crontab(hour=8, minute=0),
    },
    # Run every hour — send appointment reminder emails (24h before)
    'send-appointment-reminders-hourly': {
        'task': 'apps.tasks.reminders.send_appointment_reminders',
        'schedule': crontab(minute=0),
    },
    # Weekly digest every Monday 09:00 UTC
    'weekly-digest-monday': {
        'task': 'apps.tasks.reminders.send_weekly_digest',
        'schedule': crontab(hour=9, minute=0, day_of_week=1),
    },
}

app.conf.timezone = 'UTC'


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
