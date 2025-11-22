from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from .models import Profile, Notification
from .serializers import ProfileSerializer, ProfileUpdateSerializer, NotificationSerializer
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
from .serializers import (
    LearningStyleProfileSerializer,
    LearningStyleHistorySerializer,
    CompetencySerializer,
    CompetencyHistorySerializer,
    EngagementMetricSerializer,
    PerformanceTrendSerializer,
    InterventionFlagSerializer,
    ClassAnalyticsSnapshotSerializer,
    SystemMetricSerializer
)
from users.models import User
from backend.errors import APIErrorResponse

class UserProfileDetail(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id=None, format=None):
        """Get profile by user_id"""
        try:
            if user_id.isdigit():
                profile = Profile.objects.get(user__id=int(user_id))
            else:
                profile = Profile.objects.get(user__user_id=user_id)
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return APIErrorResponse.not_found("Profile not found")
        except Exception as e:
            return APIErrorResponse.server_error(str(e))

    def put(self, request, user_id=None, format=None):
        """Update profile by user_id"""
        try:
            if user_id.isdigit():
                profile = Profile.objects.get(user__id=int(user_id))
            else:
                profile = Profile.objects.get(user__user_id=user_id)
            serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Profile.DoesNotExist:
            return APIErrorResponse.not_found("Profile not found")
        except Exception as e:
            return APIErrorResponse.server_error(str(e))

class NotificationListCreateAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()

class NotificationDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.all()

class UserNotificationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user(self, user_id):
        try:
            if user_id.isdigit():
                return User.objects.get(id=int(user_id))
            return User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            raise NotFound("User not found")

    def get(self, request, user_id):
        user = self.get_user(user_id)
        notifications = Notification.objects.filter(user=user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class StudentAnalyticsAPIView(APIView):
    """Return consolidated analytics for a given student/profile."""
    permission_classes = [IsAuthenticated]

    def get_profile(self, user_id):
        try:
            if str(user_id).isdigit():
                return Profile.objects.get(user__id=int(user_id))
            return Profile.objects.get(user__user_id=user_id)
        except Profile.DoesNotExist:
            raise NotFound("Profile not found")

    def get(self, request, user_id):
        profile = self.get_profile(user_id)
        # Learning style
        lsp = getattr(profile, 'learning_style', None)
        lsp_data = LearningStyleProfileSerializer(lsp).data if lsp else None

        # Competencies
        comps = Competency.objects.filter(profile=profile)
        comps_data = CompetencySerializer(comps, many=True).data

        # Engagement - recent sessions
        engagements = EngagementMetric.objects.filter(profile=profile).order_by('-session_date')[:30]
        engagements_data = EngagementMetricSerializer(engagements, many=True).data

        # Performance trends
        trends = PerformanceTrend.objects.filter(profile=profile).order_by('-recorded_at')[:60]
        trends_data = PerformanceTrendSerializer(trends, many=True).data

        # Open interventions
        interventions = InterventionFlag.objects.filter(profile=profile, resolved=False)
        interventions_data = InterventionFlagSerializer(interventions, many=True).data

        return Response({
            'profile_id': profile.profile_id,
            'learning_style': lsp_data,
            'competencies': comps_data,
            'engagements': engagements_data,
            'performance_trends': trends_data,
            'interventions': interventions_data
        })


class AnalyticsOverviewAPIView(APIView):
    """Return class-level aggregates and system metrics for dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Class snapshots (latest 30)
        class_snapshots = ClassAnalyticsSnapshot.objects.all().order_by('-date')[:30]
        class_data = ClassAnalyticsSnapshotSerializer(class_snapshots, many=True).data

        # System metrics - latest per type
        sys_metrics = {}
        for mtype, _ in SystemMetric.METRIC_CHOICES:
            latest = SystemMetric.objects.filter(metric_type=mtype).order_by('-recorded_at').first()
            if latest:
                sys_metrics[mtype] = SystemMetricSerializer(latest).data

        # Simple competency distribution aggregated across students for top subjects
        # We'll compute average competency per subject from Competency table
        from django.db.models import Avg
        avg_by_subject = Competency.objects.values('subject').annotate(avg_level=Avg('level')).order_by('-avg_level')[:20]

        return Response({
            'class_snapshots': class_data,
            'system_metrics': sys_metrics,
            'competency_averages': list(avg_by_subject)
        })

    def post(self, request, user_id):
        user = self.get_user(user_id)
        data = request.data.copy()
        data['user'] = user.id
        serializer = NotificationSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)