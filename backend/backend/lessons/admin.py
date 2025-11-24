from django.contrib import admin
from .models import Lesson, Note, Topic, Grade, Subject


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name',)
    ordering = ('order',)
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'grade', 'order', 'created_at')
    list_filter = ('grade', 'created_at')
    search_fields = ('name', 'grade__name')
    ordering = ('grade', 'order')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'subject', 'created_at', 'updated_at')
    list_filter = ('created_at', 'user', 'subject', 'is_active')
    search_fields = ('title', 'user__username', 'subject__name', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'order', 'is_edit', 'created_at', 'updated_at')
    list_filter = ('created_at', 'lesson', 'is_edit')
    search_fields = ('title', 'content', 'lesson__title')
    ordering = ('lesson', 'order', '-created_at')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Basic Info', {
            'fields': ('id', 'lesson', 'title', 'order')
        }),
        ('Content', {
            'fields': ('content', 'resources'),
            'classes': ('wide',)
        }),
        ('Settings', {
            'fields': ('is_edit',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'lesson', 'created_at', 'updated_at')
    list_filter = ('created_at', 'lesson', 'user')
    search_fields = ('title', 'content', 'user__username', 'lesson__title')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')
