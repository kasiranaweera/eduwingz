import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import User
from lessons.models import Lesson, Subject
from backend.base_models import TimeStampedModel


class Quiz(TimeStampedModel):
    """A quiz that can be associated with a lesson/subject or standalone AI-generated."""

    class Difficulty(models.TextChoices):
        EASY = 'easy', _('Easy')
        MEDIUM = 'medium', _('Medium')
        HARD = 'hard', _('Hard')

    class Meta:
        verbose_name = _("Quiz")
        verbose_name_plural = _("Quizzes")
        ordering = ['-created_at']

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quizzes')
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='quizzes')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name='quizzes')
    category = models.CharField(max_length=100, blank=True, default="")
    difficulty = models.CharField(max_length=10, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    time_limit = models.IntegerField(default=30, help_text="Time limit in minutes")
    is_ai_generated = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    @property
    def question_count(self):
        return self.questions.count()

    @property
    def best_attempt(self):
        best = self.attempts.order_by('-score').first()
        return best.score if best else None

    @property
    def attempt_count(self):
        return self.attempts.count()


class Question(TimeStampedModel):
    """Individual question within a quiz."""

    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'multiple_choice', _('Multiple Choice')
        TRUE_FALSE = 'true_false', _('True/False')
        SHORT_ANSWER = 'short_answer', _('Short Answer')

    class Meta:
        verbose_name = _("Question")
        verbose_name_plural = _("Questions")
        ordering = ['order', 'created_at']

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(
        max_length=20, choices=QuestionType.choices, default=QuestionType.MULTIPLE_CHOICE
    )
    explanation = models.TextField(blank=True, default="", help_text="Explanation shown after answering")
    order = models.IntegerField(default=0)
    points = models.IntegerField(default=1)

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:60]}"


class QuestionOption(TimeStampedModel):
    """Answer option for a multiple-choice question."""

    class Meta:
        verbose_name = _("Question Option")
        verbose_name_plural = _("Question Options")
        ordering = ['order']

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    def __str__(self):
        marker = "✓" if self.is_correct else "✗"
        return f"{marker} {self.text[:50]}"


class QuizAttempt(TimeStampedModel):
    """Records a student's attempt at a quiz."""

    class Meta:
        verbose_name = _("Quiz Attempt")
        verbose_name_plural = _("Quiz Attempts")
        ordering = ['-created_at']

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    score = models.FloatField(default=0.0, help_text="Score as percentage (0-100)")
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    time_taken = models.IntegerField(default=0, help_text="Time taken in seconds")
    completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user} - {self.quiz.title}: {self.score}%"


class UserAnswer(TimeStampedModel):
    """Records a student's answer to a specific question within an attempt."""

    class Meta:
        verbose_name = _("User Answer")
        verbose_name_plural = _("User Answers")
        unique_together = ('attempt', 'question')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='user_answers')
    selected_option = models.ForeignKey(
        QuestionOption, on_delete=models.SET_NULL, null=True, blank=True, related_name='selections'
    )
    text_answer = models.TextField(blank=True, default="", help_text="For short answer questions")
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        status = "correct" if self.is_correct else "wrong"
        return f"{self.attempt.user} - Q{self.question.order}: {status}"
