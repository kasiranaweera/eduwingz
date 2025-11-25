from django.contrib import admin
from .models import Profile, OtherDetail, Notification, Achievement

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('profile_id', 'user', 'first_name', 'last_name', 'username','tagline','bio','status','created_at')
    search_fields = ('profile_id', 'user__username', 'user__email', 'first_name', 'last_name', 'username')
    readonly_fields = ('profile_id', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Info', {
            'fields': ('profile_id', 'user', 'username', 'first_name', 'last_name', 'tagline', 'status')
        }),
        ('Profile Details', {
            'fields': ('bio', 'profile_image', 'social_links', 'other')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(OtherDetail)
class OtherDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'avg_hours', 'time_period', 'strength', 'style')
    search_fields = ('subject', 'strength', 'style')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'notification_type', 'created_at')
    search_fields = ('title', 'content', 'user__username')
    list_filter = ('notification_type', 'created_at')

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'title', 'badge_color', 'points', 'earned_at')
    search_fields = ('title', 'description', 'profile__username')
    list_filter = ('badge_color', 'earned_at', 'created_at')
    readonly_fields = ('earned_at', 'created_at', 'updated_at')
