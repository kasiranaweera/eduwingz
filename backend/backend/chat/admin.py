from django.contrib import admin
from .models import ChatSession, Message, Document, Bookmark

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_user_display', 'title', 'created_at', 'updated_at')
    search_fields = ('id', 'title', 'user__username', 'user__email')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fields = ('user', 'title')
    
    def get_user_display(self, obj):
        try:
            return obj.user.username if obj.user else 'Unknown'
        except Exception as e:
            return f"Error: {str(e)}"
    get_user_display.short_description = 'User'

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_session_display', 'message_type', 'get_content_preview', 'is_good', 'is_bookmarked', 'timestamp')
    search_fields = ('id', 'content', 'session__id')
    list_filter = ('message_type', 'is_good', 'is_bookmarked', 'timestamp')
    readonly_fields = ('id', 'timestamp')
    fields = ('session', 'message_type', 'content', 'context', 'is_good', 'is_bookmarked')
    
    def get_session_display(self, obj):
        try:
            return str(obj.session.id)[:8] if obj.session else 'Unknown'
        except Exception as e:
            return f"Error: {str(e)}"
    get_session_display.short_description = 'Session'
    
    def get_content_preview(self, obj):
        try:
            content = obj.content if obj.content else ''
            return content[:50] + ('...' if len(content) > 50 else '')
        except Exception as e:
            return f"Error: {str(e)}"
    get_content_preview.short_description = 'Content'

@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_user_display', 'get_message_display', 'title', 'created_at')
    search_fields = ('id', 'title', 'content', 'user__username', 'user__email', 'message__id')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fields = ('user', 'message', 'title', 'content', 'created_at', 'updated_at')
    
    def get_user_display(self, obj):
        try:
            return obj.user.username if obj.user else 'Unknown'
        except Exception as e:
            return f"Error: {str(e)}"
    get_user_display.short_description = 'User'
    
    def get_message_display(self, obj):
        try:
            return str(obj.message.id)[:8] if obj.message else 'No Message'
        except Exception as e:
            return f"Error: {str(e)}"
    get_message_display.short_description = 'Message'

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_user_display', 'get_session_display', 'get_message_display', 'filename', 'processed', 'uploaded_at')
    search_fields = ('id', 'filename', 'user__username', 'user__email', 'session__id')
    list_filter = ('processed', 'uploaded_at')
    readonly_fields = ('id', 'uploaded_at')
    fields = ('user', 'session', 'message', 'filename', 'file', 'processed')
    
    def get_user_display(self, obj):
        try:
            return obj.user.username if obj.user else 'Unknown'
        except Exception as e:
            return f"Error: {str(e)}"
    get_user_display.short_description = 'User'
    
    def get_session_display(self, obj):
        try:
            return str(obj.session.id)[:8] if obj.session else 'No Session'
        except Exception as e:
            return f"Error: {str(e)}"
    get_session_display.short_description = 'Session'
    
    def get_message_display(self, obj):
        try:
            return str(obj.message.id)[:8] if obj.message else 'No Message'
        except Exception as e:
            return f"Error: {str(e)}"
    get_message_display.short_description = 'Message'
