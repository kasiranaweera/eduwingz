from django.contrib import admin
from .models import ChatSession, Message, Document

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'created_at', 'updated_at')
    search_fields = ('id', 'title', 'user__username', 'user__email')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fields = ('user', 'title')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'message_type', 'content', 'timestamp')
    search_fields = ('id', 'content', 'session__id')
    list_filter = ('message_type', 'timestamp')
    readonly_fields = ('id', 'timestamp')
    fields = ('session', 'message_type', 'content', 'context')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'filename', 'processed', 'uploaded_at')
    search_fields = ('id', 'filename', 'user__username', 'user__email')
    list_filter = ('processed', 'uploaded_at')
    readonly_fields = ('id', 'uploaded_at')
    fields = ('user', 'filename', 'file_path', 'processed')