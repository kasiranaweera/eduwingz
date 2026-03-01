from rest_framework import serializers
from .models import Quiz, Question, QuestionOption, QuizAttempt, UserAnswer


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'is_correct', 'order']


class QuestionOptionSafeSerializer(serializers.ModelSerializer):
    """Serializer that hides the correct answer — used during quiz-taking."""
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'explanation',
            'order', 'points', 'options',
        ]


class QuestionSafeSerializer(serializers.ModelSerializer):
    """Question serializer that hides correct answers and explanations."""
    options = QuestionOptionSafeSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'order', 'points', 'options']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.IntegerField(read_only=True)
    best_attempt = serializers.FloatField(read_only=True)
    attempt_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'category', 'difficulty',
            'time_limit', 'is_ai_generated', 'is_active',
            'question_count', 'best_attempt', 'attempt_count',
            'questions', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuizListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views (no nested questions)."""
    question_count = serializers.IntegerField(read_only=True)
    best_attempt = serializers.FloatField(read_only=True)
    attempt_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'category', 'difficulty',
            'time_limit', 'is_ai_generated', 'is_active',
            'question_count', 'best_attempt', 'attempt_count',
            'created_at',
        ]


class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = ['id', 'question', 'selected_option', 'text_answer', 'is_correct']
        read_only_fields = ['id', 'is_correct']


class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = UserAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'score', 'total_questions', 'correct_answers',
            'time_taken', 'completed', 'started_at', 'completed_at', 'answers',
        ]
        read_only_fields = [
            'id', 'score', 'total_questions', 'correct_answers',
            'started_at', 'completed_at',
        ]


class QuizAttemptListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for attempt lists."""
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'score', 'total_questions', 'correct_answers',
            'time_taken', 'completed', 'started_at', 'completed_at',
        ]


class SubmitAnswerSerializer(serializers.Serializer):
    """Serializer for submitting answers to a quiz."""
    answers = serializers.ListField(
        child=serializers.DictField(), 
        help_text="List of {question_id, selected_option_id} dicts"
    )
    time_taken = serializers.IntegerField(required=False, default=0)
