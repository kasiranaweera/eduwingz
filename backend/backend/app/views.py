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
            print(f"[PROFILE] PUT request for user_id: {user_id} with data: {request.data}")
            if user_id.isdigit():
                profile = Profile.objects.get(user__id=int(user_id))
            else:
                profile = Profile.objects.get(user__user_id=user_id)
            
            serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            
            print(f"[PROFILE] Validation errors: {serializer.errors}")
            return APIErrorResponse.bad_request("Validation failed", errors=serializer.errors)
        except Profile.DoesNotExist:
            print(f"[PROFILE] Profile not found for user_id: {user_id}")
            return APIErrorResponse.not_found(f"Profile not found for user_id: {user_id}")
        except Exception as e:
            print(f"[PROFILE] Unexpected error in put: {str(e)}")
            import traceback
            traceback.print_exc()
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


class GlobalSearchAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({"results": []})
        
        from lessons.models import Lesson, Topic
        from django.db.models import Q
        
        lessons = Lesson.objects.filter(
            Q(title__icontains=query) | 
            Q(description__icontains=query)
        )[:10]
        
        topics = Topic.objects.filter(
            Q(title__icontains=query) | 
            Q(content__icontains=query)
        )[:10]
        
        lesson_data = [{"id": str(l.id), "title": l.title, "type": "lesson", "url": f"/dashboard/platform/lessons/{l.id}"} for l in lessons]
        topic_data = [{"id": str(t.id), "title": t.title, "lesson_title": t.lesson.title if getattr(t, 'lesson', None) else "", "type": "topic", "url": getattr(t, 'lesson', None) and f"/dashboard/platform/lessons/{t.lesson.id}/topics/{t.id}" or ""} for t in topics]
        
        return Response({"results": lesson_data + topic_data})


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

        from django.db.models import Avg
        from .models import Competency, PerformanceTrend, Profile

        # Simple competency distribution aggregated across students for top subjects
        avg_by_subject = Competency.objects.values('subject').annotate(avg_level=Avg('level')).order_by('-avg_level')[:20]

        students = []
        all_profiles = Profile.objects.all()
        for p in all_profiles:
            comps = Competency.objects.filter(profile=p)
            overall = comps.aggregate(Avg('level'))['level__avg']
            if overall is None:
                overall = 0
            students.append({
                'id': p.id,
                'name': p.first_name + " " + p.last_name if p.first_name and p.last_name else p.username,
                'overall_score': round(overall, 1)
            })

        quiz_performance = {}
        curr_profile = getattr(request.user, 'app_profile', None)
        if curr_profile:
            trends = PerformanceTrend.objects.filter(profile=curr_profile).order_by('recorded_at')
            for t in trends:
                subj = t.subject
                if subj not in quiz_performance:
                    quiz_performance[subj] = []
                avg_val = PerformanceTrend.objects.filter(subject=subj, recorded_at=t.recorded_at).aggregate(Avg('score'))['score__avg']
                quiz_performance[subj].append({
                    'date': t.recorded_at.strftime('%Y-%m-%d'),
                    'score': t.score,
                    'avg_class': round(avg_val, 1) if avg_val is not None else 0,
                    'topic': t.topic
                })

        # Get engagements
        engagements = EngagementMetric.objects.all().order_by('-session_date')[:50]
        engagements_data = EngagementMetricSerializer(engagements, many=True).data
        
        # Get predictive alerts
        alerts = InterventionFlag.objects.filter(resolved=False).order_by('-flagged_at')[:20]
        alerts_data = InterventionFlagSerializer(alerts, many=True).data

        competency_averages = list(avg_by_subject)
        lowest_competencies = sorted(competency_averages, key=lambda x: x['avg_level'])[:3]
        
        # Build decision support recommendations
        recommendations = []
        if lowest_competencies:
            for comp in lowest_competencies:
                if comp['avg_level'] < 70:
                    subj = comp['subject']
                    recommendations.append({
                        'type': 'curriculum_adjustment',
                        'title': f'Review needed for {subj}',
                        'description': f'Class average is low ({round(comp["avg_level"], 1)}%). Consider revising the material or scheduling a review session.',
                        'priority': 'High' if comp['avg_level'] < 50 else 'Medium'
                    })
        
        if len(alerts) > 0:
            recommendations.append({
                'type': 'intervention',
                'title': f'{len(alerts)} students need attention',
                'description': 'Review the predictive alerts panel to identify students showing early warning signs.',
                'priority': 'High'
            })
        
        # Add a generic study habit tip based on engagements
        if len(engagements) > 0:
            recommendations.append({
                'type': 'study_habits',
                'title': 'Encourage spaced repetition',
                'description': 'Data shows engagement drops after 30 minutes. Recommend breaking study sessions into smaller chunks.',
                'priority': 'Low'
            })

        return Response({
            'class_snapshots': class_data,
            'system_metrics': sys_metrics,
            'competency_averages': competency_averages,
            'students': students,
            'quiz_performance': quiz_performance,
            'engagements': engagements_data,
            'alerts': alerts_data,
            'decision_support': recommendations
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