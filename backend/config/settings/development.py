"""
ZOARIA Development Settings
Used when DJANGO_SETTINGS_MODULE=config.settings.development
"""
from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True

# Use console email backend in dev — emails print to terminal
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# No Cloudinary in dev by default — use local file storage
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

# Looser JWT for dev
from datetime import timedelta
SIMPLE_JWT = {
    **SIMPLE_JWT,
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'root': {'handlers': ['console'], 'level': 'DEBUG'},
}
