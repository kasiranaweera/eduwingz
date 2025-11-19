from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import Lesson, Note, Topic, Grade, Subject
from .serializers import LessonSerializer, NoteSerializer, TopicSerializer, GradeSerializer, SubjectSerializer


class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        """Return lessons for the current user"""
        return Lesson.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create lesson with current user"""
        serializer.save(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a lesson by UUID"""
        # The id parameter will be captured as UUID from URL
        lesson = get_object_or_404(Lesson, id=kwargs.get('id'), user=request.user)
        serializer = self.get_serializer(lesson)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """Update a lesson by UUID"""
        lesson = get_object_or_404(Lesson, id=kwargs.get('id'), user=request.user)
        serializer = self.get_serializer(lesson, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """Partially update a lesson by UUID"""
        lesson = get_object_or_404(Lesson, id=kwargs.get('id'), user=request.user)
        serializer = self.get_serializer(lesson, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a lesson by UUID"""
        lesson = get_object_or_404(Lesson, id=kwargs.get('id'), user=request.user)
        lesson.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get'])
    def notes(self, request, id=None):
        """Get all notes for a specific lesson"""
        lesson = get_object_or_404(Lesson, id=id, user=request.user)
        notes = Note.objects.filter(lesson=lesson, user=request.user).order_by('-created_at')
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def topics(self, request, id=None):
        """Get all topics for a specific lesson"""
        lesson = get_object_or_404(Lesson, id=id, user=request.user)
        topics = Topic.objects.filter(lesson=lesson).order_by('order', 'created_at')
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_topic(self, request, id=None):
        """Add a topic to a lesson"""
        lesson = get_object_or_404(Lesson, id=id, user=request.user)
        serializer = TopicSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(lesson=lesson)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, id=None):
        """Add a note to a lesson"""
        lesson = get_object_or_404(Lesson, id=id, user=request.user)
        serializer = NoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(lesson=lesson, user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def create_session(self, request):
        """Create a new lesson session (like chat session)"""
        title = request.data.get('title', 'New Lesson Session')
        description = request.data.get('description', '')
        
        lesson = Lesson.objects.create(
            title=title,
            description=description,
            user=request.user
        )
        serializer = self.get_serializer(lesson)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return notes for the current user"""
        return Note.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create note with current user"""
        serializer.save(user=self.request.user)


class TopicViewSet(viewsets.ModelViewSet):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        """Return topics for lessons owned by current user"""
        return Topic.objects.filter(lesson__user=self.request.user).order_by('order', 'created_at')
    
    def perform_create(self, serializer):
        """Topics are created via lesson.add_topic endpoint"""
        serializer.save()


class GradeViewSet(viewsets.ReadOnlyModelViewSet):
    """List all grades - publicly accessible"""
    queryset = Grade.objects.all().order_by('order')
    serializer_class = GradeSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def subjects(self, request, id=None):
        """Get all subjects for a grade"""
        grade = get_object_or_404(Grade, id=id)
        subjects = Subject.objects.filter(grade=grade).order_by('order')
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """List all subjects - publicly accessible"""
    queryset = Subject.objects.all().order_by('grade', 'order')
    serializer_class = SubjectSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def lessons(self, request, id=None):
        """Get all lessons for a subject from current user"""
        subject = get_object_or_404(Subject, id=id)
        lessons = Lesson.objects.filter(subject=subject, user=request.user).order_by('-created_at')
        serializer = LessonSerializer(lessons, many=True)
        return Response(serializer.data)

