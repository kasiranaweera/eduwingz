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


class LearningStyleProfile(TimeStampedModel):
    """Current learning style for a student and basic confidence score."""
    class Meta:
        verbose_name = _("LearningStyleProfile")
        verbose_name_plural = _("LearningStyleProfiles")
        ordering = ['-id']

    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name='learning_style')
    current_style = models.CharField(max_length=100, blank=True)
    confidence = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.profile.profile_id} - {self.current_style}"


class LearningStyleHistory(TimeStampedModel):
    learning_style = models.ForeignKey(LearningStyleProfile, on_delete=models.CASCADE, related_name='history')
    style = models.CharField(max_length=100)
    confidence = models.FloatField(default=0.0)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.learning_style.profile.profile_id} @ {self.recorded_at}: {self.style}"


class Competency(TimeStampedModel):
    """Competency level for a particular topic for a student (0-100)."""
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='competencies')
    subject = models.CharField(max_length=150)
    topic = models.CharField(max_length=255)
    level = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('profile', 'subject', 'topic')

    def __str__(self):
        return f"{self.profile.profile_id} - {self.subject}/{self.topic}: {self.level}"


class CompetencyHistory(TimeStampedModel):
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='history')
    level = models.FloatField(default=0.0)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.competency} @ {self.recorded_at}: {self.level}"


class EngagementMetric(TimeStampedModel):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='engagements')
    session_date = models.DateField()
    duration_seconds = models.IntegerField(default=0)
    interactions = models.IntegerField(default=0)
    interaction_depth = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.profile.profile_id} - {self.session_date} ({self.duration_seconds}s)"


class PerformanceTrend(TimeStampedModel):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='performance_trends')
    subject = models.CharField(max_length=150)
    topic = models.CharField(max_length=255, blank=True)
    score = models.FloatField(default=0.0)
    recorded_at = models.DateField()

    def __str__(self):
        return f"{self.profile.profile_id} - {self.subject} @ {self.recorded_at}: {self.score}"


class InterventionFlag(TimeStampedModel):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='interventions')
    subject = models.CharField(max_length=150)
    topic = models.CharField(max_length=255, blank=True)
    reason = models.TextField(blank=True)
    flagged_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.profile.profile_id} - {self.subject}/{self.topic} - {'resolved' if self.resolved else 'open'}"


class ClassAnalyticsSnapshot(TimeStampedModel):
    """Optional snapshot for aggregated class-level analytics."""
    class_name = models.CharField(max_length=255)
    date = models.DateField()
    avg_score = models.FloatField(default=0.0)
    distribution = models.JSONField(default=dict, blank=True)
    common_difficulties = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.class_name} @ {self.date}"


class SystemMetric(TimeStampedModel):
    METRIC_CHOICES = [
        ('response_time', 'Response Time'),
        ('rag_accuracy', 'RAG Accuracy'),
        ('user_satisfaction', 'User Satisfaction'),
        ('feature_usage', 'Feature Usage')
    ]
    metric_type = models.CharField(max_length=50, choices=METRIC_CHOICES)
    value = models.FloatField(default=0.0)
    metadata = models.JSONField(default=dict, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.metric_type} @ {self.recorded_at}: {self.value}"
