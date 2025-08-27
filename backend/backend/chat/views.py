import requests
import json
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser
from django.conf import settings
from .models import ChatSession, Message, Document
import uuid
import logging
from backend.errors import APIErrorResponse

logger = logging.getLogger(__name__)

class ChatSessionView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all chat sessions for the authenticated user"""
        sessions = ChatSession.objects.filter(user=request.user)
        response_data = [
            {
                "id": str(session.id),
                "title": session.title,
                "created_at": session.created_at,
                "updated_at": session.updated_at,
                "message_count": session.message_set.count()
            }
            for session in sessions
        ]
        return Response(response_data)

    def post(self, request):
        """Create a new chat session"""
        title = request.data.get("title")
        session = ChatSession.objects.create(user=request.user, title=title)
        return Response({
            "id": str(session.id),
            "title": session.title,
            "created_at": session.created_at,
            "updated_at": session.updated_at,
            "message_count": 0
        }, status=201)

class ChatSessionDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        """Get details of a specific chat session"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            messages = session.message_set.all()
            response_data = {
                "id": str(session.id),
                "title": session.title,
                "created_at": session.created_at,
                "updated_at": session.updated_at,
                "message_count": messages.count(),
                "messages": [
                    {
                        "id": str(msg.id),
                        "message_type": msg.message_type,
                        "content": msg.content,
                        "context": json.loads(msg.context) if msg.context else None,
                        "timestamp": msg.timestamp
                    }
                    for msg in messages
                ]
            }
            return Response(response_data)
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

    def delete(self, request, session_id):
        """Delete a chat session"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            session.delete()
            # Notify FastAPI to clear session history
            fastapi_url = f"{settings.FASTAPI_URL}/api/chat/clear/{session_id}"
            headers = {"Authorization": f"Bearer {request.auth}"}
            try:
                response = requests.post(fastapi_url, headers=headers)
                response.raise_for_status()
            except requests.RequestException as e:
                logger.error(f"Error notifying FastAPI: {str(e)}")
            return Response({"message": "Session deleted successfully"})
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

class ChatMessageView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        """Send a message and get a response from FastAPI"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            content = request.data.get("content")
            if not content:
                return APIErrorResponse.bad_request("Content is required")

            # Store user message
            user_message = Message.objects.create(
                session=session,
                message_type="user",
                content=content
            )

            # Forward query to FastAPI
            fastapi_url = f"{settings.FASTAPI_URL}/api/chat/process"
            headers = {"Authorization": f"Bearer {request.auth}"}
            try:
                response = requests.post(
                    fastapi_url,
                    headers=headers,
                    json={"content": content, "session_id": str(session_id)}
                )
                response.raise_for_status()
                fastapi_data = response.json()

                # Store assistant message
                assistant_message = Message.objects.create(
                    session=session,
                    message_type="assistant",
                    content=fastapi_data["answer"],
                    context=json.dumps(fastapi_data.get("context", []))
                )

                # Update session title if empty
                if not session.title:
                    session.title = content[:50] + ("..." if len(content) > 50 else "")
                    session.save()

                return Response({
                    "user_message": {
                        "id": str(user_message.id),
                        "message_type": user_message.message_type,
                        "content": user_message.content,
                        "context": None,
                        "timestamp": user_message.timestamp
                    },
                    "assistant_message": {
                        "id": str(assistant_message.id),
                        "message_type": assistant_message.message_type,
                        "content": assistant_message.content,
                        "context": fastapi_data.get("context"),
                        "timestamp": assistant_message.timestamp
                    }
                }, status=201)
            except requests.RequestException as e:
                logger.error(f"Error proxying to FastAPI: {str(e)}")
                return APIErrorResponse.server_error(str(e))
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

class DocumentUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        """Upload a PDF and process it via FastAPI"""
        file = request.FILES.get("file")
        if not file or not file.name.endswith('.pdf'):
            return APIErrorResponse.bad_request("Only PDF files are supported")

        # Save file with unique name
        file_id = uuid.uuid4()
        file_path = f"media/uploads/{file_id}_{file.name}"
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(file.read())

        # Create Document record
        document = Document.objects.create(
            user=request.user,
            filename=file.name,
            file_path=file_path,
            processed=False
        )

        # Process via FastAPI
        fastapi_url = f"{settings.FASTAPI_URL}/api/documents/process"
        headers = {"Authorization": f"Bearer {request.auth}"}
        try:
            with open(file_path, "rb") as f:
                response = requests.post(
                    fastapi_url,
                    headers=headers,
                    files={"file": (f"{file_id}_{file.name}", f, "application/pdf")}
                )
                response.raise_for_status()
                document.processed = True
                document.save()
                return Response({
                    "id": str(document.id),
                    "filename": document.filename,
                    "processed": document.processed,
                    "message": "Document uploaded and processed successfully"
                }, status=201)
        except requests.RequestException as e:
            logger.error(f"Error processing document via FastAPI: {str(e)}")
            return APIErrorResponse.server_error(str(e))

class DocumentListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all documents for the authenticated user"""
        documents = Document.objects.filter(user=request.user)
        return Response([
            {
                "id": str(doc.id),
                "filename": doc.filename,
                "processed": doc.processed,
                "uploaded_at": doc.uploaded_at
            }
            for doc in documents
        ])