from django.urls import path
from . import views

urlpatterns = [
    path('user/<str:user_id>/profile/', views.UserProfileDetail.as_view(), name='user-profile'),
    path('notifications/', views.NotificationListCreateAPIView.as_view(), name='notification-list-create'),
    path('notifications/<int:pk>/', views.NotificationDetailAPIView.as_view(), name='notification-detail'),
    path('user/<str:user_id>/notifications/', views.UserNotificationAPIView.as_view(), name='user-notifications'),
]