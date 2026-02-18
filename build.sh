#!/bin/bash
set -o errexit

# Navigate to backend directory
cd backend/backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --no-input
