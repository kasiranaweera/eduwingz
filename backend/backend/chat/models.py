from django.db import models
from users.models import User
import uuid

class ChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_sessions'

    def __str__(self):
        return self.title or str(self.id)[:12]

class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE)
    message_type = models.CharField(max_length=50)  # 'user' or 'assistant'
    content = models.TextField()
    context = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    parent_message = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='child_messages')
    is_good = models.BooleanField(default=False, help_text="Marks if this message is a good response")
    is_bookmarked = models.BooleanField(default=False, help_text="Marks if this message is bookmarked")

    class Meta:
        db_table = 'messages'

    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."

class Bookmark(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='bookmarks')
    title = models.CharField(max_length=255, null=True, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookmarks'
        unique_together = ('user', 'message')

    def __str__(self):
        return f"Bookmark: {self.title or self.message.id}"

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='documents')
    message = models.ForeignKey('Message', null=True, blank=True, on_delete=models.CASCADE, related_name='documents')
    filename = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/', null=True, blank=True)
    file_path = models.CharField(max_length=255, blank=True)
    processed = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'documents'

    def __str__(self):
        display_name = self.filename or (self.file.name if self.file else None)
        return display_name or str(self.id)[:12]

    def delete(self, using=None, keep_parents=False):
        storage = self.file.storage if self.file else None
        file_name = self.file.name if self.file else None
        super().delete(using=using, keep_parents=keep_parents)
        if storage and file_name:
            storage.delete(file_name)
