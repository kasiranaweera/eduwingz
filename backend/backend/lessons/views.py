from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import Lesson, Note, Topic, Grade, Subject
from .serializers import LessonSerializer, NoteSerializer, TopicSerializer, GradeSerializer, SubjectSerializer
import json
from pathlib import Path
import os
import requests


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

    @action(detail=False, methods=['post'])
    def generate_lesson(self, request):
        """
        Generate lesson content using Qwen LLM via FastAPI - BLOCKING/SYNCHRONOUS
        
        Waits for topic generation to complete before returning.
        Shows loading indicator to user during generation.
        """
        grade = request.data.get('grade')
        subject = request.data.get('subject')
        topic = request.data.get('topic')
        lesson_id = request.data.get('lesson_id')
        lesson_type = request.data.get('lesson_type', 'default')
        
        if not all([grade, subject, topic, lesson_id]):
            return Response(
                {'error': 'Missing required fields: grade, subject, topic, lesson_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the lesson
        lesson = get_object_or_404(Lesson, id=lesson_id, user=request.user)
        
        print(f"🚀 Starting lesson generation: {lesson_id}")
        print(f"   Topic: {topic}, Subject: {subject}, Grade: {grade}")
        
        try:
            # Generate topics synchronously (blocking - wait for completion)
            result = self._generate_topics_synchronous(lesson, grade, subject, topic, lesson_type)
            
            # Return successful response with generated topics
            return Response({
                'status': 'complete',
                'lesson_id': str(lesson_id),
                'message': f'✅ Generated {len(result["topics"])} topics for "{topic}"',
                'topics': result['topics']
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"❌ Generation failed: {str(e)}")
            return Response({
                'status': 'error',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _generate_topics_synchronous(self, lesson, grade, subject, topic, lesson_type):
        """
        Synchronous function to generate topics (blocking - waits for completion)
        Allows frontend to show loading indicator during generation
        """
        print(f"\n⏳ Generating topics...")
        
        # Prepare attachments
        attachments = []
        if lesson_type == 'default':
            grade_folder = f"grade_{grade}"
            base_docs_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                'docs', 
                grade_folder
            )
            
            textbook_path = os.path.join(base_docs_path, 'textbook', f'{subject.lower()}.pdf')
            if os.path.exists(textbook_path):
                print(f"📚 Found textbook: {subject}")
                attachments.append({
                    'type': 'textbook',
                    'path': textbook_path,
                    'name': f'{subject} Textbook'
                })
            
            teaching_guide_path = os.path.join(base_docs_path, 'teaching_guide', f'{subject.lower()}.pdf')
            if os.path.exists(teaching_guide_path):
                print(f"📖 Found teaching guide: {subject}")
                attachments.append({
                    'type': 'teaching_guide',
                    'path': teaching_guide_path,
                    'name': f'{subject} Teaching Guide'
                })
        
        # Call FastAPI with retry logic
        max_retries = 3
        retry_count = 0
        response = None
        
        print(f"📡 Calling FastAPI service...")
        
        while retry_count < max_retries:
            try:
                fastapi_url = os.getenv('FASTAPI_URL', 'http://127.0.0.1:8000')
                endpoint = f"{fastapi_url}/api/lessons/generate"
                
                payload = {
                    "grade": grade,
                    "subject": subject,
                    "topic": topic,
                    "attachments": attachments
                }
                
                headers = {
                    "Content-Type": "application/json",
                }
                
                print(f"   Attempt {retry_count + 1}/{max_retries}...")
                
                # Make request with extended timeout (10 minutes)
                response = requests.post(endpoint, json=payload, headers=headers, timeout=600)
                break  # Success, exit retry loop
                
            except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                retry_count += 1
                print(f"   ⚠️ Connection error: {str(e)[:80]}")
                
                if retry_count < max_retries:
                    wait_time = 5 * retry_count  # 5s, 10s, 15s
                    print(f"   🔄 Retrying in {wait_time} seconds...")
                    import time
                    time.sleep(wait_time)
                else:
                    raise Exception(f"Failed to connect to FastAPI after {max_retries} attempts: {str(e)[:100]}")
        
        if response is None:
            raise Exception("Failed to get response from FastAPI")
        
        print(f"✅ FastAPI responded: {response.status_code}")
        
        if response.status_code != 200:
            error_msg = f"FastAPI error: {response.status_code}"
            if response.status_code in [503, 504]:
                error_msg += " (Server busy or temporarily unavailable)"
            raise Exception(error_msg)
        
        response_data = response.json()
        
        if not response_data.get('success'):
            error_msg = response_data.get('message', 'Failed to generate topics')
            raise Exception(error_msg)
        
        generated_topics = response_data.get('topics', [])
        
        if not generated_topics:
            raise Exception("No topics generated")
        
        print(f"📥 Received {len(generated_topics)} topics from FastAPI")
        print(f"💾 Saving to database...")
        
        # Create Topic objects in database with EMPTY content
        # Content will be generated on-demand via the "Generate content" button
        created_topics = []
        for i, main_topic in enumerate(generated_topics, 1):
            topic_obj = Topic.objects.create(
                lesson=lesson,
                title=main_topic.get('title', f'Topic {i}'),
                content='',  # Start with empty, generate on-demand
                order=main_topic.get('order', i)
            )
            created_topics.append({
                'id': str(topic_obj.id),
                'title': topic_obj.title,
                'order': topic_obj.order
            })
            print(f"   ✅ Created topic {i}: {topic_obj.title}")
        
        print(f"✅ COMPLETE! Created {len(created_topics)} topics")
        
        return {
            'status': 'complete',
            'topics': created_topics
        }


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

    @action(detail=True, methods=['post'])
    def generate_content(self, request, id=None):
        """Generate (preview) or save detailed content for a single Topic using FastAPI.

        Request JSON:
          { "save": true/false }

        If save is True the generated content will be stored in the Topic.content and returned.
        If save is False (default) the generated content is returned but not saved (preview).
        """
        topic_obj = get_object_or_404(Topic, id=id, lesson__user=request.user)
        save_flag = bool(request.data.get('save', False))

        # Prepare attachment context (optional, reusing lesson docs lookup)
        attachments = []
        lesson = topic_obj.lesson
        grade = str(lesson.grade.id) if hasattr(lesson, 'grade') and lesson.grade is not None else str(request.data.get('grade', ''))
        subject = lesson.subject.name if hasattr(lesson, 'subject') and lesson.subject is not None else request.data.get('subject', '')

        # Call FastAPI endpoint with session_id for ILS adaptive learning profile
        fastapi_url = os.getenv('FASTAPI_URL', 'http://127.0.0.1:8000')
        endpoint = f"{fastapi_url}/api/lessons/generate_content"
        
        # Try to get session_id from lesson or request data for learner profile lookup
        session_id = request.user.username  # Use username as session identifier
        
        payload = {
            'grade': grade,
            'subject': subject,
            'topic_title': topic_obj.title,
            'session_id': session_id,  # For ILS learning profile lookup
            'attachments': attachments
        }

        # Retry logic
        max_retries = 3
        retry = 0
        response = None
        while retry < max_retries:
            try:
                response = requests.post(endpoint, json=payload, headers={"Content-Type": "application/json"}, timeout=120)
                break
            except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                retry += 1
                if retry < max_retries:
                    import time
                    time.sleep(3 * retry)
                else:
                    return Response({'error': f'Failed to contact FastAPI: {str(e)}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if response is None:
            return Response({'error': 'No response from FastAPI'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if response.status_code != 200:
            return Response({'error': f'FastAPI error: {response.status_code}', 'detail': response.text}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        data = response.json()
        content = data.get('content', '')

        if save_flag:
            topic_obj.content = content
            topic_obj.save()

        return Response({'success': True, 'content': content, 'saved': save_flag}, status=status.HTTP_200_OK)


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

