from django.urls import path
from .views import ChatSessionView, ChatSessionDetailView, ChatMessageView, SessionDocumentView, DocumentListView, MessageDocumentView, ContinueMessageView, MarkMessageGoodView, BookmarkToggleView

urlpatterns = [
    path('sessions/', ChatSessionView.as_view(), name='chat-sessions'),
    path('sessions/<uuid:session_id>/', ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('sessions/<uuid:session_id>/messages/', ChatMessageView.as_view(), name='chat-messages'),
    path('sessions/<uuid:session_id>/continue/', ContinueMessageView.as_view(), name='continue-message'),
    path('sessions/<uuid:session_id>/messages/<uuid:message_id>/mark-good/', MarkMessageGoodView.as_view(), name='mark-message-good'),
    path('sessions/<uuid:session_id>/messages/<uuid:message_id>/bookmark/', BookmarkToggleView.as_view(), name='bookmark-toggle'),
    path('sessions/<uuid:session_id>/documents/', SessionDocumentView.as_view(), name='session-documents'),
    path('documents/', DocumentListView.as_view(), name='document-list'),
    path('documents/<uuid:message_id>/', MessageDocumentView.as_view(), name='message-documents'),
]
