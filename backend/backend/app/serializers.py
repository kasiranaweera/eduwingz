from rest_framework import serializers
from .models import Profile, OtherDetail, Notification
from .models import (
    LearningStyleProfile,
    LearningStyleHistory,
    Competency,
    CompetencyHistory,
    EngagementMetric,
    PerformanceTrend,
    InterventionFlag,
    ClassAnalyticsSnapshot,
    SystemMetric
)
from users.models import User
from users.serializer import UserSerializer

class OtherDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtherDetail
        fields = ['id', 'subject', 'avg_hours', 'time_period', 'strength', 'style']

class ProfileSerializer(serializers.ModelSerializer):
    other = OtherDetailSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'profile_id',
            'user',
            'first_name',
            'last_name',
            'username',
            'tagline',
            'bio',
            'status',
            'other',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['profile_id', 'created_at', 'updated_at']

class ProfileUpdateSerializer(serializers.ModelSerializer):
    other = OtherDetailSerializer(required=False)

    class Meta:
        model = Profile
        fields = ['first_name', 'last_name', 'username', 'bio', 'tagline', 'status', 'other']

    def validate_username(self, value):
        profile = self.instance
        if value != profile.username:
            if Profile.objects.filter(username=value).exclude(id=profile.id).exists():
                raise serializers.ValidationError("This username is already taken.")
        return value

    def update(self, instance, validated_data):
        other_data = validated_data.pop('other', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if other_data:
            if instance.other:
                for attr, value in other_data.items():
                    setattr(instance.other, attr, value)
                instance.other.save()
            else:
                other = OtherDetail.objects.create(**other_data)
                instance.other = other
                instance.save()
        return instance

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'content', 'notification_type', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LearningStyleHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningStyleHistory
        fields = ['id', 'learning_style', 'style', 'confidence', 'recorded_at']


class LearningStyleProfileSerializer(serializers.ModelSerializer):
    history = LearningStyleHistorySerializer(many=True, read_only=True)

    class Meta:
        model = LearningStyleProfile
        fields = ['id', 'profile', 'current_style', 'confidence', 'history']


class CompetencyHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CompetencyHistory
        fields = ['id', 'competency', 'level', 'recorded_at']


class CompetencySerializer(serializers.ModelSerializer):
    history = CompetencyHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Competency
        fields = ['id', 'profile', 'subject', 'topic', 'level', 'history']


class EngagementMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = EngagementMetric
        fields = ['id', 'profile', 'session_date', 'duration_seconds', 'interactions', 'interaction_depth']


class PerformanceTrendSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceTrend
        fields = ['id', 'profile', 'subject', 'topic', 'score', 'recorded_at']


class InterventionFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterventionFlag
        fields = ['id', 'profile', 'subject', 'topic', 'reason', 'flagged_at', 'resolved']


class ClassAnalyticsSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassAnalyticsSnapshot
        fields = ['id', 'class_name', 'date', 'avg_score', 'distribution', 'common_difficulties']


class SystemMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemMetric
        fields = ['id', 'metric_type', 'value', 'metadata', 'recorded_at']

