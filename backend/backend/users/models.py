from django.db import models
from django.contrib.auth.models import AbstractUser
from backend.base_models import TimeStampedModel
from backend.utils import create_user_id

class User(AbstractUser, TimeStampedModel):
    user_id = models.CharField(default='', max_length=100, blank=True)
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    # Indicates whether the user has verified their email address
    is_email_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        if self.user_id and self.user_id != '':
            return self.user_id
        return self.email
    
    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.user_id:
            self.user_id = create_user_id(self.id)
            # Use update to avoid infinite recursion or multiple save signals if preferred, 
            # but a simple save here is fine as is_new will be False now.
            super().save(update_fields=['user_id'])