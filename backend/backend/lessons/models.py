import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import User
from backend.base_models import TimeStampedModel


class Grade(TimeStampedModel):
    """Grade level (e.g., 10, 11, 12)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = _("Grade")
        verbose_name_plural = _("Grades")
        ordering = ['order']
    
    def __str__(self):
        return self.name


class Subject(TimeStampedModel):
    """Subject for a grade level (e.g., Mathematics, Science)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    order = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = _("Subject")
        verbose_name_plural = _("Subjects")
        ordering = ['grade', 'order']
        unique_together = ('grade', 'name')
    
    def __str__(self):
        return f"{self.grade.name} - {self.name}"


class Lesson(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lessons')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name='lessons')
    description = models.TextField(blank=True, default="")
    content = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _("Lesson")
        verbose_name_plural = _("Lessons")
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Topic(TimeStampedModel):
    """Topics within a lesson, containing content, resources, and edit status"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, default="")
    resources = models.TextField(blank=True, default="")
    is_edit = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = _("Topic")
        verbose_name_plural = _("Topics")
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return self.title


class Note(TimeStampedModel):
    class Meta:
        verbose_name = _("Note")
        verbose_name_plural = _("Notes")
        ordering = ['-created_at']

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField(blank=True)
    description = models.CharField(max_length=1023, blank=True)

    def __str__(self):
        return self.title or str(self.id)
