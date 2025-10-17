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

    class Meta:
        db_table = 'messages'

    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255)
    processed = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'documents'

    def __str__(self):
        return self.filename