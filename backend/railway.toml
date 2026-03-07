[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
releaseCommand = "python manage.py migrate --noinput && python manage.py seed_db"
startCommand = "daphne -b 0.0.0.0 -p $PORT config.asgi:application"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
