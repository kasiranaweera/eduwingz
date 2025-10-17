from django.urls import path
from .views import ChatSessionView, ChatSessionDetailView, ChatMessageView, DocumentUploadView, DocumentListView

urlpatterns = [
    path('sessions/', ChatSessionView.as_view(), name='chat-sessions'),
    path('sessions/<uuid:session_id>/', ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('sessions/<uuid:session_id>/messages/', ChatMessageView.as_view(), name='chat-messages'),
    path('documents/upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('documents/', DocumentListView.as_view(), name='document-list'),
]