from django.urls import path
from .views import RegisterView, LoginView, ChatbotView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('chat/', ChatbotView.as_view(), name='chat'),
]