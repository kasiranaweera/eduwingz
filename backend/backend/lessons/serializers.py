from rest_framework import serializers
from .models import Lesson, Note, Topic, Grade, Subject


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'name', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubjectSerializer(serializers.ModelSerializer):
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    
    class Meta:
        model = Subject
        fields = ['id', 'grade', 'grade_name', 'name', 'description', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'title', 'content', 'resources', 'is_edit', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LessonSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    topics_count = serializers.SerializerMethodField()
    notes_count = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'content', 'user', 'subject', 'subject_name', 'is_active', 'topics', 'topics_count', 'notes_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'notes_count', 'topics_count', 'topics']
    
    def get_notes_count(self, obj):
        return obj.notes.count()
    
    def get_topics_count(self, obj):
        return obj.topics.count()


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'description', 'lesson', 'user', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
