from django.db import models
from django.contrib.auth.models import AbstractUser
from backend.base_models import TimeStampedModel
from backend.utils import create_user_id

class User(AbstractUser, TimeStampedModel):
    user_id = models.CharField(default='user_id', max_length=100)
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.user_id if self.user_id != 'user_id' else self.username
    
    def save(self, *args, **kwargs):
        # Generate a unique user_id if it's the default value
        if self.user_id == 'user_id' and self.id:
            self.user_id = create_user_id(self.id)
        super().save(*args, **kwargs)