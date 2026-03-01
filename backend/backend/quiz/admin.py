from django.contrib import admin
from .models import Quiz, Question, QuestionOption, QuizAttempt, UserAnswer


class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 4


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1
    show_change_link = True


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'category', 'difficulty', 'is_ai_generated', 'created_at']
    list_filter = ['difficulty', 'is_ai_generated', 'is_active']
    search_fields = ['title', 'description']
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'question_text', 'question_type', 'order']
    list_filter = ['question_type']
    inlines = [QuestionOptionInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'quiz', 'score', 'correct_answers', 'total_questions', 'completed', 'created_at']
    list_filter = ['completed']
    readonly_fields = ['started_at', 'completed_at']
