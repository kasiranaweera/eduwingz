from django.contrib import admin
from .models import Profile, OtherDetail, Notification

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('profile_id', 'user', 'first_name', 'last_name', 'username', 'created_at')
    search_fields = ('profile_id', 'user__username', 'user__email', 'first_name', 'last_name', 'username')
    readonly_fields = ('profile_id', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')

@admin.register(OtherDetail)
class OtherDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'avg_hours', 'time_period', 'strength', 'style')
    search_fields = ('subject', 'strength', 'style')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'notification_type', 'created_at')
    search_fields = ('title', 'content', 'user__username')
    list_filter = ('notification_type', 'created_at')