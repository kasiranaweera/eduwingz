from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from .models import Profile, Notification
from .serializers import ProfileSerializer, ProfileUpdateSerializer, NotificationSerializer
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

    def post(self, request, user_id):
        user = self.get_user(user_id)
        data = request.data.copy()
        data['user'] = user.id
        serializer = NotificationSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)