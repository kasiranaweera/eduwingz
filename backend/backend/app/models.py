from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from users.models import User
from backend.base_models import TimeStampedModel
from backend.utils import create_profile_id

class OtherDetail(models.Model):
    class Meta:
        verbose_name = _("OtherDetail")
        verbose_name_plural = _("OtherDetails")
        ordering = ['id']

    subject = models.CharField(max_length=100, blank=True)
    avg_hours = models.CharField(max_length=100, blank=True)
    time_period = models.CharField(max_length=100, blank=True)
    strength = models.CharField(max_length=255, blank=True)
    style = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return str(self.id)

class Profile(TimeStampedModel):
    class Meta:
        verbose_name = _("Profile")
        verbose_name_plural = _("Profiles")
        ordering = ['id']

    profile_id = models.CharField(max_length=100, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='app_profile')
    username = models.CharField(max_length=150, blank=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    tagline = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    status = models.CharField(max_length=100, blank=True)
    other = models.ForeignKey(OtherDetail, on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return self.profile_id

    def save(self, *args, **kwargs):
        if not self.profile_id and self.user_id:
            self.profile_id = create_profile_id(self.user_id)
        if not self.username and self.user:
            self.username = self.user.username
        super().save(*args, **kwargs)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        try:
            other_detail = OtherDetail.objects.create(
                subject='',
                avg_hours='',
                time_period='',
                strength='',
                style=''
            )
            Profile.objects.create(
                user=instance,
                profile_id=create_profile_id(instance.id),
                username=instance.username,
                other=other_detail
            )
        except Exception as e:
            print(f"Error creating profile for user {instance.id}: {e}")
    else:
        try:
            profile = getattr(instance, 'app_profile', None)
            if profile:
                if instance.username != profile.username:
                    profile.username = instance.username
                    profile.save()
            else:
                other_detail = OtherDetail.objects.create(
                    subject='',
                    avg_hours='',
                    time_period='',
                    strength='',
                    style=''
                )
                Profile.objects.create(
                    user=instance,
                    profile_id=create_profile_id(instance.id),
                    username=instance.username,
                    other=other_detail
                )
        except Exception as e:
            print(f"Error with profile for user {instance.id}: {e}")

class Notification(TimeStampedModel):
    class Meta:
        verbose_name = _("Notification")
        verbose_name_plural = _("Notifications")
        ordering = ['-id']

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255, blank=True)
    content = models.CharField(max_length=1023, blank=True)
    notification_type = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return str(self.id)
    

class Lesson(TimeStampedModel):
    title = models.CharField(max_length=255)
    
    class Meta:
        verbose_name = _("Lesson")
        verbose_name_plural = _("Lessons")
        ordering = ['-id']
    
    def __str__(self):
        return self.title

class Note(TimeStampedModel):
    class Meta:
        verbose_name = _("Note")
        verbose_name_plural = _("Notes")
        ordering = ['-id']

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField(blank=True)
    description = models.CharField(max_length=1023, blank=True)

    def __str__(self):
        return self.title or str(self.id)