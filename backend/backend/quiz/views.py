import json
import requests
import logging
from django.conf import settings
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Quiz, Question, QuestionOption, QuizAttempt, UserAnswer
from .serializers import (
    QuizSerializer, QuizListSerializer,
    QuestionSerializer,
    QuizAttemptSerializer, QuizAttemptListSerializer,
    SubmitAnswerSerializer,
)

logger = logging.getLogger(__name__)


class QuizViewSet(viewsets.ModelViewSet):
    """Full CRUD + AI generation + attempt submission for quizzes."""
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        """Return quizzes for the current user."""
        return Quiz.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return QuizListSerializer
        return QuizSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # ==================== AI Quiz Generation ====================

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_quiz(self, request):
        """
        Generate a quiz using AI via FastAPI.
        
        Request body:
            {
                "topic": "Algebra",
                "subject": "Mathematics",
                "grade": "Grade 10",
                "difficulty": "medium",
                "num_questions": 5,
                "question_type": "multiple_choice",
                "lesson_id": "optional-uuid"
            }
        """
        topic = request.data.get('topic', '')
        subject = request.data.get('subject', '')
        grade = request.data.get('grade', '')
        difficulty = request.data.get('difficulty', 'medium')
        num_questions = int(request.data.get('num_questions', 5))
        question_type = request.data.get('question_type', 'multiple_choice')
        lesson_id = request.data.get('lesson_id')

        if not topic:
            return Response(
                {"detail": "Topic is required for quiz generation"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Call FastAPI to generate quiz content
        fastapi_url = getattr(settings, 'FASTAPI_URL', 'http://localhost:8001')
        try:
            token = request.META.get('HTTP_AUTHORIZATION', '')
            resp = requests.post(
                f"{fastapi_url}/generate-quiz",
                json={
                    "topic": topic,
                    "subject": subject,
                    "grade": grade,
                    "difficulty": difficulty,
                    "num_questions": num_questions,
                    "question_type": question_type,
                },
                headers={"Authorization": token},
                timeout=120,
            )

            if resp.status_code != 200:
                logger.error(f"FastAPI quiz generation failed: {resp.status_code} - {resp.text}")
                return Response(
                    {"detail": f"AI quiz generation failed: {resp.text}"},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            ai_data = resp.json()
        except requests.exceptions.ConnectionError:
            logger.warning("FastAPI not available, generating fallback quiz")
            ai_data = self._generate_fallback_quiz(topic, subject, difficulty, num_questions)
        except Exception as e:
            logger.error(f"Quiz generation error: {e}")
            return Response(
                {"detail": f"Quiz generation error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Save to database
        from lessons.models import Lesson, Subject as LessonSubject
        lesson = None
        subject_obj = None

        if lesson_id:
            try:
                lesson = Lesson.objects.get(id=lesson_id, user=request.user)
            except Lesson.DoesNotExist:
                pass

        if subject:
            subject_obj = LessonSubject.objects.filter(name__icontains=subject).first()

        quiz = Quiz.objects.create(
            title=ai_data.get('title', f"{topic} Quiz"),
            description=ai_data.get('description', f"AI-generated quiz on {topic}"),
            user=request.user,
            lesson=lesson,
            subject=subject_obj,
            category=subject or topic,
            difficulty=difficulty,
            time_limit=ai_data.get('time_limit', 30),
            is_ai_generated=True,
        )

        # Create questions and options
        for i, q_data in enumerate(ai_data.get('questions', [])):
            question = Question.objects.create(
                quiz=quiz,
                question_text=q_data.get('question', ''),
                question_type=question_type,
                explanation=q_data.get('explanation', ''),
                order=i + 1,
                points=1,
            )
            for j, opt in enumerate(q_data.get('options', [])):
                QuestionOption.objects.create(
                    question=question,
                    text=opt if isinstance(opt, str) else opt.get('text', ''),
                    is_correct=(j == q_data.get('correct', 0)),
                    order=j,
                )

        serializer = QuizSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _generate_fallback_quiz(self, topic, subject, difficulty, num_questions):
        """Generate a basic placeholder quiz when FastAPI is unavailable."""
        questions = []
        for i in range(min(num_questions, 5)):
            questions.append({
                "question": f"Sample question {i+1} about {topic}",
                "options": [
                    f"Option A for question {i+1}",
                    f"Option B for question {i+1}",
                    f"Option C for question {i+1}",
                    f"Option D for question {i+1}",
                ],
                "correct": 0,
                "explanation": f"This is a placeholder question. Connect to AI for real quiz generation.",
            })
        return {
            "title": f"{topic} Quiz",
            "description": f"Quiz on {topic} ({difficulty})",
            "time_limit": 30,
            "questions": questions,
        }

    # ==================== Quiz Attempts ====================

    @action(detail=True, methods=['post'], url_path='start')
    def start_attempt(self, request, id=None):
        """Start a new quiz attempt."""
        quiz = self.get_object()
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            user=request.user,
            total_questions=quiz.question_count,
        )
        # Return quiz with safe serializer (no correct answers shown)
        from .serializers import QuestionSafeSerializer
        questions = quiz.questions.all().order_by('order')
        return Response({
            "attempt_id": str(attempt.id),
            "quiz": {
                "id": str(quiz.id),
                "title": quiz.title,
                "description": quiz.description,
                "time_limit": quiz.time_limit,
                "difficulty": quiz.difficulty,
            },
            "questions": QuestionSafeSerializer(questions, many=True).data,
        })

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_attempt(self, request, id=None):
        """
        Submit answers for a quiz attempt.
        
        Request body:
            {
                "attempt_id": "uuid",
                "answers": [
                    {"question_id": "uuid", "selected_option_id": "uuid"},
                    ...
                ],
                "time_taken": 300
            }
        """
        quiz = self.get_object()
        attempt_id = request.data.get('attempt_id')
        answers_data = request.data.get('answers', [])
        time_taken = request.data.get('time_taken', 0)

        try:
            attempt = QuizAttempt.objects.get(
                id=attempt_id, quiz=quiz, user=request.user, completed=False
            )
        except QuizAttempt.DoesNotExist:
            return Response(
                {"detail": "Active attempt not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        correct_count = 0
        results = []

        for ans in answers_data:
            question_id = ans.get('question_id')
            option_id = ans.get('selected_option_id')

            try:
                question = Question.objects.get(id=question_id, quiz=quiz)
            except Question.DoesNotExist:
                continue

            selected_option = None
            is_correct = False

            if option_id:
                try:
                    selected_option = QuestionOption.objects.get(id=option_id, question=question)
                    is_correct = selected_option.is_correct
                except QuestionOption.DoesNotExist:
                    pass

            if is_correct:
                correct_count += 1

            user_answer = UserAnswer.objects.create(
                attempt=attempt,
                question=question,
                selected_option=selected_option,
                is_correct=is_correct,
            )

            # Build result with correct answer revealed
            correct_option = question.options.filter(is_correct=True).first()
            results.append({
                "question_id": str(question.id),
                "question_text": question.question_text,
                "selected_option_id": str(option_id) if option_id else None,
                "correct_option_id": str(correct_option.id) if correct_option else None,
                "correct_option_text": correct_option.text if correct_option else "",
                "is_correct": is_correct,
                "explanation": question.explanation,
            })

        total = attempt.total_questions or len(answers_data)
        score = (correct_count / total * 100) if total > 0 else 0

        attempt.correct_answers = correct_count
        attempt.score = round(score, 1)
        attempt.time_taken = time_taken
        attempt.completed = True
        attempt.completed_at = timezone.now()
        attempt.save()

        return Response({
            "attempt_id": str(attempt.id),
            "score": attempt.score,
            "correct_answers": correct_count,
            "total_questions": total,
            "time_taken": time_taken,
            "results": results,
        })

    @action(detail=True, methods=['get'], url_path='attempts')
    def list_attempts(self, request, id=None):
        """List all attempts for a quiz."""
        quiz = self.get_object()
        attempts = QuizAttempt.objects.filter(quiz=quiz, user=request.user)
        serializer = QuizAttemptListSerializer(attempts, many=True)
        return Response(serializer.data)


class QuizAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for quiz attempts — detailed review."""
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user)
