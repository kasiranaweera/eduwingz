#!/bin/bash
set -e

# Navigate to backend directory and build
cd backend/backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input
