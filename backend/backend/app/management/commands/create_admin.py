from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()


class Command(BaseCommand):
    help = "Create default admin user if not exists"

    def handle(self, *args, **kwargs):
        username = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")
        email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@eduwingz.com")
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "admin@eduwingz1!")

        # Since USERNAME_FIELD is 'email', check by email first
        if not User.objects.filter(email=email).exists():
            self.stdout.write(f"Creating superuser '{username}' with email '{email}'...")
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f"✓ Superuser created successfully")
            )
            self.stdout.write(self.style.SUCCESS(f"  Credentials: {email} / {password}"))
        else:
            self.stdout.write(
                self.style.WARNING(f"✓ Superuser with email '{email}' already exists")
            )
            self.stdout.write(f"  Login at /admin using the email address as the username.")
