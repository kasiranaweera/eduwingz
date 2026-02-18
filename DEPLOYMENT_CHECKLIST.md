# Render Deployment Checklist

## Before Deployment

- [ ] Code committed and pushed to GitHub (branch: `llm`)
- [ ] All environment-specific code reviewed
- [ ] `.env` file added to `.gitignore` (don't commit secrets)
- [ ] Database migrations tested locally
- [ ] All dependencies in `requirements.txt`

## Render Setup

- [ ] PostgreSQL database created on Render
  - [ ] Database URL copied
  - [ ] Database name: `eduwingz_db`
  - [ ] User created

- [ ] Web Service created on Render
  - [ ] GitHub repository connected
  - [ ] Branch selected: `llm`
  - [ ] Build command configured
  - [ ] Start command configured

## Environment Variables Set

- [ ] `DEBUG` = `False`
- [ ] `SECRET_KEY` = (generate new one)
- [ ] `DATABASE_URL` = (from PostgreSQL)
- [ ] `ALLOWED_HOSTS` = `your-service.onrender.com,localhost`
- [ ] `CORS_ALLOWED_ORIGINS` = your frontend URL
- [ ] `FASTAPI_URL` = (if applicable)
- [ ] Email settings (if needed)

## First Deployment

- [ ] Web service successfully deployed
- [ ] Check deployment logs for errors
- [ ] No build failures
- [ ] Service running (green status)

## Post-Deployment

- [ ] Run migrations via Shell
- [ ] Create superuser account
- [ ] Test API endpoints
- [ ] Verify database connectivity
- [ ] Check static files serving
- [ ] CORS settings working with frontend
- [ ] Email notifications configured

## Ongoing Monitoring

- [ ] Monitor deployment logs
- [ ] Check error rates
- [ ] Monitor database usage
- [ ] Test API periodically
- [ ] Review performance metrics

## Quick Commands

```bash
# View logs
tail -f /var/log/service.log

# Create superuser (in Render Shell)
python manage.py createsuperuser

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --no-input
```

## Helpful Links

- Render Dashboard: https://dashboard.render.com
- Django Settings: backend/backend/backend/settings.py
- Requirements: backend/backend/requirements.txt
- GitHub Repo: https://github.com/kasiranaweera/eduwingz
