from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LessonViewSet, NoteViewSet, TopicViewSet, GradeViewSet, SubjectViewSet, TopicDiscussionViewSet

router = DefaultRouter()
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'discussions', TopicDiscussionViewSet, basename='discussion')

urlpatterns = [
    path('', include(router.urls)),
]
