"""
ZOARIA - Base Django Settings
"""
import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'zoaria-dev-secret-key-change-in-production')

DEBUG = False

ALLOWED_HOSTS = []

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'channels',
    'django_celery_beat',
    'cloudinary',
    'cloudinary_storage',
]

LOCAL_APPS = [
    'apps.users',
    'apps.vets',
    'apps.pets',
    'apps.health',
    'apps.feeding',
    'apps.activity',
    'apps.calendar_app',
    'apps.chat',
    'apps.payments',
    'apps.notifications',
    'apps.hub',
    'apps.admin_panel',
    'apps.uploads',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database
import dj_database_url


def _clean_env(value: str | None):
    """Normalize environment variable values (trim spaces/quotes)."""
    if value is None:
        return None
    value = value.strip().strip("'").strip('\"')
    return value or None


def _first_env(*keys: str):
    """Return the first non-empty normalized environment variable from keys."""
    for key in keys:
        value = _clean_env(os.environ.get(key))
        if value is not None:
            return value
    return None


def _env_bool(key: str, default: bool = False):
    value = _first_env(key)
    if value is None:
        return default
    return value.lower() in {'1', 'true', 'yes', 'on'}


DATABASE_URL = _first_env(
    'DATABASE_URL',
    'DATABASE_PRIVATE_URL',
    'POSTGRES_URL',
    'POSTGRES_PRIVATE_URL',
)

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=_env_bool('DB_SSL_REQUIRE', default=False),
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            # Prefer provider vars (PG*/POSTGRES_*) over local docker-style DB_* overrides.
            'NAME': _first_env('PGDATABASE', 'POSTGRES_DB', 'DB_NAME') or 'zoaria',
            'USER': _first_env('PGUSER', 'POSTGRES_USER', 'DB_USER') or 'postgres',
            'PASSWORD': _first_env('PGPASSWORD', 'POSTGRES_PASSWORD', 'DB_PASSWORD') or 'postgres',
            'HOST': _first_env('PGHOST', 'POSTGRES_HOST', 'DB_HOST') or 'localhost',
            'PORT': _first_env('PGPORT', 'POSTGRES_PORT', 'DB_PORT') or '5432',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static & Media files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# WhiteNoise — serve static files in production without a separate web server
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Cloudinary — default storage for uploaded media
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── DRF ──────────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ─── JWT ──────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# ─── CHANNELS / REDIS ─────────────────────────────────────────────────────────
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [REDIS_URL],
        },
    },
}

# ─── CELERY ───────────────────────────────────────────────────────────────────
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# ─── EMAIL ────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = 'ZOARIA <noreply@zoaria.app>'

# ─── STRIPE ───────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

STRIPE_PLANS = {
    'basic': None,  # Free
    'standard': os.environ.get('STRIPE_STANDARD_PRICE_ID', ''),
    'premium': os.environ.get('STRIPE_PREMIUM_PRICE_ID', ''),
}

# ─── CLOUDINARY ───────────────────────────────────────────────────────────────
CLOUDINARY_URL = os.environ.get('CLOUDINARY_URL', '')

# ─── FRONTEND URL ─────────────────────────────────────────────────────────────
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
