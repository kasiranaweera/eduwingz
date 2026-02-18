# Django Backend Deployment on Render

This guide will help you deploy your Django backend to Render.

## Prerequisites

- Your code pushed to GitHub (https://github.com/kasiranaweera/eduwingz)
- A Render account (https://render.com)
- Environment variables prepared

## Step 1: Push your code to GitHub

Make sure all changes are committed and pushed:

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin llm
```

## Step 2: Create a PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Fill in the details:
   - **Name**: `eduwingz-db` (or similar)
   - **Database**: `eduwingz_db`
   - **User**: `eduwingz_user`
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: 15
   - **Plan**: Free (optional, can upgrade later)
4. Click **Create Database**
5. Copy the **Internal Database URL** (you'll need this)

## Step 3: Create a Web Service on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Select **Deploy an existing repository**
4. Search for and select your GitHub repository: `eduwingz`
5. Fill in the details:
   - **Name**: `eduwingz-backend` (or similar)
   - **Region**: Same as database region
   - **Branch**: `llm` (or your current branch)
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```
     cd backend/backend && pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
     ```
   - **Start Command**: 
     ```
     cd backend/backend && gunicorn backend.wsgi:application
     ```
   - **Plan**: Free (or paid if needed)

6. Click **Create Web Service**

## Step 4: Set Environment Variables

After the web service is created:

1. Go to your web service dashboard
2. Click on **Environment** (or **Settings** → **Environment Variables**)
3. Add the following environment variables:

| Key | Value |
|-----|-------|
| `DEBUG` | `False` |
| `SECRET_KEY` | Generate a new Django secret key (see below) |
| `DATABASE_URL` | Copy from your PostgreSQL database internal URL |
| `ALLOWED_HOSTS` | `your-service-name.onrender.com,localhost` |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend-domain.onrender.com,http://localhost:3000` |
| `FASTAPI_URL` | Your FastAPI URL (if using it) |

### Generate a Secret Key

In Python, run:
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Copy the output and paste it as the `SECRET_KEY` value.

## Step 5: Manual Deploy

1. Go to your web service on Render dashboard
2. Click the **Manual Deploy** button and select your branch
3. Check the deploy logs to ensure everything succeeds

## Step 6: Run Migrations

After the first successful deploy:

1. Go to your web service dashboard
2. Click on the **Shell** tab
3. Run:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser  # Create admin user
   ```

## Troubleshooting

### Build Failures

Check the **Logs** tab in your Render dashboard for error messages.

Common issues:
- Missing environment variables → Add them in Environment settings
- Database URL incorrect → Copy the Internal Database URL again
- Dependencies not installed → Check `requirements.txt` is complete

### Static Files Not Loading

Run in the Shell:
```bash
python manage.py collectstatic --no-input
```

### Database Issues

To access the database directly (if needed):
```bash
psql <your-internal-database-url>
```

## Files Created/Modified

- `backend/backend/requirements.txt` - Added `gunicorn`, `dj-database-url`, `whitenoise`
- `backend/backend/backend/settings.py` - Updated for production
- `backend/backend/Procfile` - Gunicorn configuration
- `build.sh` - Build script for Render
- `.env.render` - Template for environment variables

## Monitoring

- Check logs in Render dashboard → **Logs** tab
- Monitor uptime and metrics in the dashboard
- Enable email notifications for deploy failures

## Next Steps

1. After successful deployment, test your API endpoints
2. Set up CORS correctly for your frontend
3. Configure email settings if needed
4. Set up custom domain if available
5. Monitor database usage and upgrade if needed
