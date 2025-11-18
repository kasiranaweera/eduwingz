import requests
import json
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser
from django.conf import settings
from .models import ChatSession, Message, Document, Bookmark
import uuid
import logging
from backend.errors import APIErrorResponse

logger = logging.getLogger(__name__)

def serialize_document(document, request=None):
    if not document:
        return None

    file_url = None
    if document.file:
        file_url = document.file.url
        if request:
            try:
                file_url = request.build_absolute_uri(file_url)
            except Exception:
                pass
    elif document.file_path:
        file_url = document.file_path
        if request and not document.file_path.startswith('http'):
            base_path = document.file_path.lstrip('/')
            media_url = getattr(settings, 'MEDIA_URL', '/media/')
            file_url = request.build_absolute_uri(f"{media_url}{base_path}")

    return {
        "id": str(document.id),
        "filename": document.filename,
        "processed": document.processed,
        "uploaded_at": document.uploaded_at,
        "session_id": str(document.session_id),
        "message_id": str(document.message_id) if document.message_id else None,
        "file_url": file_url
    }

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
                        "timestamp": msg.timestamp,
                        "parent_message_id": str(msg.parent_message_id) if msg.parent_message else None,
                        "child_message_id": str(msg.child_messages.first().id) if msg.child_messages.exists() else None
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

    def get(self, request, session_id, message_id=None):
        """Retrieve all messages in a session or a specific message pair"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            if message_id:
                # Retrieve specific message pair
                try:
                    user_message = Message.objects.get(id=message_id, session=session, message_type="user")
                    assistant_message = user_message.child_messages.first()
                    response_data = {
                        "user_message": {
                            "id": str(user_message.id),
                            "message_type": user_message.message_type,
                            "content": user_message.content,
                            "context": None,
                        "timestamp": user_message.timestamp,
                        "documents": [
                            serialize_document(doc, request=request)
                            for doc in user_message.documents.all()
                        ]
                        },
                        "assistant_message": {
                            "id": str(assistant_message.id),
                            "message_type": assistant_message.message_type,
                            "content": assistant_message.content,
                            "context": json.loads(assistant_message.context) if assistant_message.context else None,
                            "timestamp": assistant_message.timestamp,
                            "is_good": assistant_message.is_good,
                            "is_bookmarked": assistant_message.is_bookmarked
                        } if assistant_message else None
                    }
                    return Response(response_data)
                except Message.DoesNotExist:
                    return APIErrorResponse.not_found("Message not found")
            else:
                # Retrieve all messages, grouped as pairs
                messages = session.message_set.filter(message_type="user")
                response_data = []
                for user_message in messages:
                    assistant_message = user_message.child_messages.first()
                    pair = {
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
                            "context": json.loads(assistant_message.context) if assistant_message.context else None,
                            "timestamp": assistant_message.timestamp,
                            "is_good": assistant_message.is_good,
                            "is_bookmarked": assistant_message.is_bookmarked
                        } if assistant_message else None
                    }
                    response_data.append(pair)
                return Response(response_data)
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

    def post(self, request, session_id):
        """Create a new user-assistant message pair"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            content = request.data.get("content")
            if not content:
                return APIErrorResponse.bad_request("Content is required")

            document_ids = request.data.get("document_ids", [])
            if isinstance(document_ids, str):
                try:
                    parsed_value = json.loads(document_ids)
                    document_ids = parsed_value if isinstance(parsed_value, list) else [document_ids]
                except json.JSONDecodeError:
                    document_ids = [document_ids]

            if not isinstance(document_ids, list):
                return APIErrorResponse.bad_request("document_ids must be a list")

            document_ids = [doc_id for doc_id in document_ids if doc_id]
            
            # Documents to attach to this message (only explicitly provided ones)
            documents_to_attach = None
            
            # Documents to search in RAG (all session documents if none specified)
            documents_to_search = None
            
            if not document_ids:
                # If no document_ids provided, get all processed documents from the session for RAG search
                documents_to_search = Document.objects.filter(
                    user=request.user, 
                    session=session,
                    processed=True
                ).order_by("-uploaded_at")
            else:
                # Validate provided document_ids
                documents_to_attach = Document.objects.filter(id__in=document_ids, user=request.user, session=session)
                if documents_to_attach.count() != len(set(document_ids)):
                    return APIErrorResponse.bad_request("One or more documents were not found for this session")
                
                # Check if documents are already attached to another message
                for document in documents_to_attach:
                    if document.message_id:
                        return APIErrorResponse.bad_request("One or more documents are already attached to another message")
                
                # Use provided documents for search
                documents_to_search = documents_to_attach

            # Store user message
            user_message = Message.objects.create(
                session=session,
                message_type="user",
                content=content
            )

            # Forward query to FastAPI
            fastapi_url = f"{settings.FASTAPI_URL}/api/chat/process"
            headers = {"Authorization": f"Bearer {request.auth}"}
            payload = {
                "content": content,
                "session_id": str(session_id)
            }
            # Always include document_ids if there are processed documents to search
            if documents_to_search and documents_to_search.exists():
                payload["document_ids"] = [str(doc.id) for doc in documents_to_search]

            try:
                response = requests.post(
                    fastapi_url,
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                fastapi_data = response.json()

                # Store assistant message, linking to user message
                # Store is_incomplete flag in context metadata if present
                context_data = fastapi_data.get("context", [])
                if fastapi_data.get("is_incomplete"):
                    # Add incomplete flag to context metadata
                    context_metadata = {"is_incomplete": True}
                    if isinstance(context_data, list):
                        context_metadata["context_docs"] = context_data
                    else:
                        context_metadata["context_docs"] = []
                    context_json = json.dumps(context_metadata)
                else:
                    context_json = json.dumps(context_data)
                
                assistant_message = Message.objects.create(
                    session=session,
                    message_type="assistant",
                    content=fastapi_data["answer"],
                    context=context_json,
                    parent_message=user_message
                )

                # Attach documents to the user message (only if explicitly provided)
                if documents_to_attach:
                    for document in documents_to_attach:
                        document.message = user_message
                        if not document.filename:
                            document.filename = os.path.basename(document.file.name) if document.file else document.filename
                        document.save(update_fields=["message", "filename"])

                # Update session title if empty
                if not session.title:
                    session.title = content[:50] + ("..." if len(content) > 50 else "")
                    session.save()

                # Parse context to check for is_incomplete flag
                context_data = fastapi_data.get("context", [])
                is_incomplete = fastapi_data.get("is_incomplete", False)
                
                return Response({
                    "user_message": {
                        "id": str(user_message.id),
                        "message_type": user_message.message_type,
                        "content": user_message.content,
                        "context": None,
                        "timestamp": user_message.timestamp,
                        "documents": [
                            serialize_document(doc, request=request)
                            for doc in user_message.documents.all()
                        ]
                    },
                    "assistant_message": {
                        "id": str(assistant_message.id),
                        "message_type": assistant_message.message_type,
                        "content": assistant_message.content,
                        "context": context_data,
                        "is_incomplete": is_incomplete,
                        "is_good": assistant_message.is_good,
                        "is_bookmarked": assistant_message.is_bookmarked,
                        "timestamp": assistant_message.timestamp
                    }
                }, status=201)
            except requests.RequestException as e:
                logger.error(f"Error proxying to FastAPI: {str(e)}")
                return APIErrorResponse.server_error(str(e))
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

    def put(self, request, session_id, message_id):
        """Update a user-assistant message pair"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            try:
                user_message = Message.objects.get(id=message_id, session=session, message_type="user")
                assistant_message = user_message.child_messages.first()
                if not assistant_message:
                    return APIErrorResponse.bad_request("No assistant message linked to this user message")

                new_content = request.data.get("content")
                if not new_content:
                    return APIErrorResponse.bad_request("Content is required")

                document_ids = request.data.get("document_ids", None)
                if isinstance(document_ids, str):
                    try:
                        parsed_value = json.loads(document_ids)
                        document_ids = parsed_value if isinstance(parsed_value, list) else [document_ids]
                    except json.JSONDecodeError:
                        document_ids = [document_ids]

                documents = None
                if document_ids is not None:
                    if not isinstance(document_ids, list):
                        return APIErrorResponse.bad_request("document_ids must be a list")
                    document_ids = [doc_id for doc_id in document_ids if doc_id]
                    documents = list(Document.objects.filter(id__in=document_ids, user=request.user, session=session))
                    if len(set(document_ids)) != len(documents):
                        return APIErrorResponse.bad_request("One or more documents were not found for this session")
                    for document in documents:
                        if document.message_id and document.message_id != str(user_message.id):
                            return APIErrorResponse.bad_request("One or more documents are already attached to another message")
                else:
                    documents = list(user_message.documents.all())
                    document_ids = [str(doc.id) for doc in documents]

                # Update user message
                user_message.content = new_content
                user_message.save()

                # Reprocess through FastAPI for updated assistant response
                fastapi_url = f"{settings.FASTAPI_URL}/api/chat/process"
                headers = {"Authorization": f"Bearer {request.auth}"}
                payload = {
                    "content": new_content,
                    "session_id": str(session_id)
                }
                if document_ids:
                    payload["document_ids"] = document_ids

                try:
                    response = requests.post(
                        fastapi_url,
                        headers=headers,
                        json=payload
                    )
                    response.raise_for_status()
                    fastapi_data = response.json()

                    # Update assistant message
                    assistant_message.content = fastapi_data["answer"]
                    assistant_message.context = json.dumps(fastapi_data.get("context", []))
                    assistant_message.save()

                    if request.data.get("document_ids", None) is not None:
                        # Detach documents not in the updated list
                        Document.objects.filter(message=user_message).exclude(id__in=document_ids).update(message=None)
                        for document in documents:
                            document.message = user_message
                            if not document.filename:
                                document.filename = os.path.basename(document.file.name) if document.file else document.filename
                            document.save(update_fields=["message", "filename"])

                    return Response({
                        "user_message": {
                            "id": str(user_message.id),
                            "message_type": user_message.message_type,
                            "content": user_message.content,
                            "context": None,
                            "timestamp": user_message.timestamp,
                            "documents": [
                                serialize_document(doc, request=request)
                                for doc in user_message.documents.all()
                            ]
                        },
                        "assistant_message": {
                            "id": str(assistant_message.id),
                            "message_type": assistant_message.message_type,
                            "content": assistant_message.content,
                            "context": fastapi_data.get("context"),
                            "is_good": assistant_message.is_good,
                            "is_bookmarked": assistant_message.is_bookmarked,
                            "timestamp": assistant_message.timestamp
                        }
                    })
                except requests.RequestException as e:
                    logger.error(f"Error proxying to FastAPI: {str(e)}")
                    return APIErrorResponse.server_error(str(e))
            except Message.DoesNotExist:
                return APIErrorResponse.not_found("Message not found")
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

    def delete(self, request, session_id, message_id):
        """Delete a user-assistant message pair"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            try:
                user_message = Message.objects.get(id=message_id, session=session, message_type="user")
                assistant_message = user_message.child_messages.first()
                user_message.delete()
                if assistant_message:
                    assistant_message.delete()
                return Response({"message": "Message pair deleted successfully"})
            except Message.DoesNotExist:
                return APIErrorResponse.not_found("Message not found")
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

class MarkMessageGoodView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id, message_id):
        """Mark an assistant message as a good response"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            try:
                message = Message.objects.get(id=message_id, session=session, message_type="assistant")
                is_good = request.data.get("is_good", True)
                message.is_good = is_good
                message.save(update_fields=["is_good"])
                
                return Response({
                    "id": str(message.id),
                    "message_type": message.message_type,
                    "is_good": message.is_good,
                    "content": message.content[:100] + "..." if len(message.content) > 100 else message.content,
                    "message": f"Message marked as {'good' if is_good else 'not good'}"
                })
            except Message.DoesNotExist:
                return APIErrorResponse.not_found("Message not found")
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

    def put(self, request, session_id, message_id):
        """Update the is_good status of an assistant message"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            try:
                message = Message.objects.get(id=message_id, session=session, message_type="assistant")
                is_good = request.data.get("is_good", True)
                message.is_good = is_good
                message.save(update_fields=["is_good"])
                
                return Response({
                    "id": str(message.id),
                    "message_type": message.message_type,
                    "is_good": message.is_good,
                    "content": message.content[:100] + "..." if len(message.content) > 100 else message.content,
                    "message": f"Message marked as {'good' if is_good else 'not good'}"
                })
            except Message.DoesNotExist:
                return APIErrorResponse.not_found("Message not found")
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

class SessionDocumentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def get(self, request, session_id):
        """List all documents for a session owned by the authenticated user"""
        try:
            ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

        documents = Document.objects.filter(user=request.user, session_id=session_id).order_by("uploaded_at")
        return Response([
            serialize_document(document, request=request)
            for document in documents
        ])

    def post(self, request, session_id):
        """Upload a PDF for a session and process it via FastAPI"""
        logger.info(f"Upload request received for session {session_id}")
        logger.info(f"Request FILES keys: {list(request.FILES.keys())}")
        logger.info(f"Request content type: {request.content_type}")
        
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

        file = request.FILES.get("file")
        if not file:
            logger.error("No file in request.FILES")
            logger.error(f"Available keys: {list(request.FILES.keys())}")
            return APIErrorResponse.bad_request("No file provided")
        
        logger.info(f"File received: {file.name}, size: {file.size}, content_type: {file.content_type}")
        
        if not file.name.lower().endswith('.pdf'):
            return APIErrorResponse.bad_request("Only PDF files are supported")

        # Ensure media directory exists
        media_root = settings.MEDIA_ROOT
        documents_dir = os.path.join(media_root, 'documents')
        os.makedirs(documents_dir, exist_ok=True)
        logger.info(f"Media root: {media_root}, Documents dir: {documents_dir}")

        unique_name = f"{uuid.uuid4()}_{file.name}"
        logger.info(f"Creating document with unique name: {unique_name}")
        
        document = Document.objects.create(
            user=request.user,
            session=session,
            filename=file.name,
            processed=False
        )
        
        try:
            # Reset file pointer to beginning
            file.seek(0)
            
            # Method 1: Use Django's file.save() method
            logger.info(f"Saving file using document.file.save()...")
            document.file.save(unique_name, file, save=True)
            
            # Refresh from DB to get the updated file path
            document.refresh_from_db()
            
            logger.info(f"After save - document.file.name: {document.file.name}")
            logger.info(f"document.file: {document.file}")
            
            # Verify file was saved
            if not document.file or not document.file.name:
                # Try alternative method: save file manually
                logger.warning("File field empty, trying manual save...")
                file.seek(0)
                file_path = os.path.join(documents_dir, unique_name)
                
                # Write file manually
                with open(file_path, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
                
                # Now use Django's file storage to save it properly
                from django.core.files import File as DjangoFile
                with open(file_path, 'rb') as f:
                    document.file.save(unique_name, DjangoFile(f), save=True)
                
                document.refresh_from_db()
                document.file_path = document.file.name or f"documents/{unique_name}"
                document.save(update_fields=["file_path"])
                logger.info(f"File saved manually to: {file_path}, document.file.name: {document.file.name}")
            else:
                document.file_path = document.file.name
                document.save(update_fields=["file_path"])
            
            # Verify file exists
            if document.file:
                file_path = document.file.path if hasattr(document.file, 'path') else os.path.join(media_root, document.file.name)
                if not os.path.exists(file_path):
                    raise ValueError(f"File does not exist at path: {file_path}")
                
                file_size = os.path.getsize(file_path)
                logger.info(f"File saved successfully: {document.file.name} at {file_path}, size: {file_size} bytes")
            else:
                raise ValueError("File field is still empty after save")
                
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}", exc_info=True)
            if document.id:
                document.delete()
            return APIErrorResponse.server_error(f"Failed to save file: {str(e)}")

        fastapi_url = f"{settings.FASTAPI_URL}/api/documents/process"
        headers = {"Authorization": f"Bearer {request.auth}"}
        try:
            # Open the saved file for FastAPI
            if not document.file:
                raise ValueError("File field is empty")
            with document.file.open("rb") as file_obj:
                response = requests.post(
                    fastapi_url,
                    headers=headers,
                    files={"file": (unique_name, file_obj, "application/pdf")},
                    data={
                        "session_id": str(session_id),
                        "document_id": str(document.id)
                    }
                )
                response.raise_for_status()
                document.processed = True
                document.save(update_fields=["processed"])
                return Response({
                    "id": str(document.id),
                    "filename": document.filename,
                    "processed": document.processed,
                    "session_id": str(document.session_id),
                    "file_url": serialize_document(document, request=request)["file_url"],
                    "message": "Document uploaded and processed successfully"
                }, status=201)
        except requests.RequestException as e:
            logger.error(f"Error processing document via FastAPI: {str(e)}")
            document.delete()
            return APIErrorResponse.server_error(str(e))

class DocumentListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all documents for the authenticated user"""
        documents = Document.objects.filter(user=request.user)
        session_filter = request.query_params.get("session_id")
        if session_filter:
            documents = documents.filter(session_id=session_filter)

        documents = documents.order_by("-uploaded_at")
        return Response([
            serialize_document(doc, request=request)
            for doc in documents
        ])

class ContinueMessageView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        """Continue generating response from where it left off"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

        # Forward continue request to FastAPI
        fastapi_url = f"{settings.FASTAPI_URL}/api/chat/continue"
        headers = {"Authorization": f"Bearer {request.auth}"}
        payload = {
            "session_id": str(session_id)
        }

        try:
            response = requests.post(
                fastapi_url,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            fastapi_data = response.json()

            # Get the last assistant message and update it
            last_assistant_message = Message.objects.filter(
                session=session,
                message_type="assistant"
            ).order_by("-timestamp").first()

            if last_assistant_message:
                # Update with full answer
                last_assistant_message.content = fastapi_data.get("full_answer", fastapi_data.get("answer", ""))
                last_assistant_message.save()

            return Response({
                "answer": fastapi_data.get("answer", ""),
                "full_answer": fastapi_data.get("full_answer", ""),
                "is_incomplete": fastapi_data.get("is_incomplete", False),
                "message_id": str(last_assistant_message.id) if last_assistant_message else None
            })
        except requests.RequestException as e:
            logger.error(f"Error continuing response via FastAPI: {str(e)}")
            return APIErrorResponse.server_error(str(e))

class MessageDocumentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, message_id):
        """Get all documents attached to a specific message"""
        try:
            message = Message.objects.get(id=message_id)
            # Verify the message belongs to a session owned by the user
            if message.session.user != request.user:
                return APIErrorResponse.forbidden("You don't have permission to access this message's documents")
            
            documents = Document.objects.filter(message=message, user=request.user).order_by("uploaded_at")
            return Response([
                serialize_document(doc, request=request)
                for doc in documents
            ])
        except Message.DoesNotExist:
            return APIErrorResponse.not_found("Message not found")

class BookmarkToggleView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id, message_id):
        """Toggle bookmark status for a message"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            try:
                message = Message.objects.get(id=message_id, session=session)
                is_bookmarked = request.data.get("is_bookmarked", True)
                
                if is_bookmarked:
                    # Create or get the bookmark
                    title = request.data.get("title", message.content[:100])
                    content = request.data.get("content", message.content)
                    
                    bookmark, created = Bookmark.objects.get_or_create(
                        user=request.user,
                        message=message,
                        defaults={
                            "title": title,
                            "content": content
                        }
                    )
                    message.is_bookmarked = True
                else:
                    # Delete the bookmark
                    Bookmark.objects.filter(user=request.user, message=message).delete()
                    message.is_bookmarked = False
                
                message.save(update_fields=["is_bookmarked"])
                
                return Response({
                    "id": str(message.id),
                    "is_bookmarked": message.is_bookmarked,
                    "content": message.content[:100] + "..." if len(message.content) > 100 else message.content,
                    "message": f"Message {'bookmarked' if is_bookmarked else 'unbookmarked'}"
                })
            except Message.DoesNotExist:
                return APIErrorResponse.not_found("Message not found")
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")

    def put(self, request, session_id, message_id):
        """Update bookmark status for a message"""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            try:
                message = Message.objects.get(id=message_id, session=session)
                is_bookmarked = request.data.get("is_bookmarked", True)
                
                if is_bookmarked:
                    # Create or get the bookmark
                    title = request.data.get("title", message.content[:100])
                    content = request.data.get("content", message.content)
                    
                    bookmark, created = Bookmark.objects.get_or_create(
                        user=request.user,
                        message=message,
                        defaults={
                            "title": title,
                            "content": content
                        }
                    )
                    message.is_bookmarked = True
                else:
                    # Delete the bookmark
                    Bookmark.objects.filter(user=request.user, message=message).delete()
                    message.is_bookmarked = False
                
                message.save(update_fields=["is_bookmarked"])
                
                return Response({
                    "id": str(message.id),
                    "is_bookmarked": message.is_bookmarked,
                    "content": message.content[:100] + "..." if len(message.content) > 100 else message.content,
                    "message": f"Message {'bookmarked' if is_bookmarked else 'unbookmarked'}"
                })
            except Message.DoesNotExist:
                return APIErrorResponse.not_found("Message not found")
        except ChatSession.DoesNotExist:
            return APIErrorResponse.not_found("Session not found")
