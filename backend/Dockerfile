FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files (whitenoise serves them)
RUN python manage.py collectstatic --noinput --settings=config.settings.production || true

EXPOSE 8000

CMD sh -c "python -m daphne -b 0.0.0.0 -p $PORT config.asgi:application"
