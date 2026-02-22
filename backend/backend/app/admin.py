from django.contrib import admin
from .models import (
    Profile, OtherDetail, Notification, Achievement,
    LearningStyleProfile, LearningStyleHistory, Competency,
    CompetencyHistory, EngagementMetric, PerformanceTrend,
    InterventionFlag, ClassAnalyticsSnapshot, SystemMetric
)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('profile_id', 'get_user_display', 'first_name', 'last_name', 'username','tagline','status','created_at')
    search_fields = ('profile_id', 'user__username', 'user__email', 'first_name', 'last_name', 'username')
    readonly_fields = ('profile_id', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at', 'status')
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
    
    def get_user_display(self, obj):
        try:
            return obj.user.username if obj.user else 'Unknown'
        except Exception as e:
            return f"Error: {str(e)}"
    get_user_display.short_description = 'User'

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

@admin.register(LearningStyleProfile)
class LearningStyleProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'current_style', 'confidence')
    search_fields = ('profile__profile_id', 'current_style')
    list_filter = ('current_style',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(LearningStyleHistory)
class LearningStyleHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'learning_style', 'style', 'confidence', 'recorded_at')
    search_fields = ('learning_style__profile__profile_id', 'style')
    list_filter = ('style', 'recorded_at')
    readonly_fields = ('recorded_at', 'created_at', 'updated_at')

@admin.register(Competency)
class CompetencyAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'subject', 'topic', 'level')
    search_fields = ('profile__profile_id', 'subject', 'topic')
    list_filter = ('subject', 'created_at')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(CompetencyHistory)
class CompetencyHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'competency', 'level', 'recorded_at')
    search_fields = ('competency__profile__profile_id', 'competency__subject')
    list_filter = ('recorded_at', 'created_at')
    readonly_fields = ('recorded_at', 'created_at', 'updated_at')

@admin.register(EngagementMetric)
class EngagementMetricAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'session_date', 'duration_seconds', 'interactions')
    search_fields = ('profile__profile_id',)
    list_filter = ('session_date', 'created_at')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(PerformanceTrend)
class PerformanceTrendAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'subject', 'topic', 'score', 'recorded_at')
    search_fields = ('profile__profile_id', 'subject', 'topic')
    list_filter = ('subject', 'recorded_at', 'created_at')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(InterventionFlag)
class InterventionFlagAdmin(admin.ModelAdmin):
    list_display = ('id', 'profile', 'subject', 'topic', 'resolved', 'flagged_at')
    search_fields = ('profile__profile_id', 'subject', 'topic')
    list_filter = ('resolved', 'flagged_at', 'created_at')
    readonly_fields = ('flagged_at', 'created_at', 'updated_at')

@admin.register(ClassAnalyticsSnapshot)
class ClassAnalyticsSnapshotAdmin(admin.ModelAdmin):
    list_display = ('id', 'class_name', 'date', 'avg_score')
    search_fields = ('class_name',)
    list_filter = ('date', 'created_at')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(SystemMetric)
class SystemMetricAdmin(admin.ModelAdmin):
    list_display = ('id', 'metric_type', 'value', 'recorded_at')
    search_fields = ('metric_type',)
    list_filter = ('metric_type', 'recorded_at', 'created_at')
    readonly_fields = ('recorded_at', 'created_at', 'updated_at')
