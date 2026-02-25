from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import uvicorn
from datetime import datetime
import jwt
import os
from pydantic import BaseModel, Field
from typing import Optional, List
import asyncio
from contextlib import asynccontextmanager
import io
import base64
import sys
import traceback

print("🚀 FastAPI startup initiated...")

# Try to import minimal required dependencies
try:
    print("⚙️ Loading configuration...")
    from config import settings
    print("✅ Configuration loaded")
except Exception as e:
    print(f"⚠️ Warning: Could not import settings: {e}")
    # Create a minimal settings object for fallback
    class MinimalSettings:
        SECRET_KEY = os.getenv("SECRET_KEY", "fallback-key-not-for-production")
        ALGORITHM = "HS256"
    settings = MinimalSettings()

# edu design generator router - lightweight, import at startup
try:
    print("📚 Importing edu_design_generator...")
    from edu_design_generator.router import router as edu_design_router
    print("✅ Edu design generator imported")
except Exception as e:
    print(f"⚠️ Warning: Could not import edu_design_router: {e}")
    edu_design_router = None

# MAIN SERVICES - Will be imported lazily on first request
RAGService = None
ReasoningAgent = None
LessonGeneratorService = None
MAIN_SERVICES_AVAILABLE = False

rag_service = None  # LAZY - Will be initialized on first request, not at startup
agent_service = None  # Will be initialized after RAG service
lesson_generator_service = None  # Will be initialized after RAG service
tts_engine = None
stt_engine = None
_initialization_lock = asyncio.Lock()
_services_initialized = False
_initialization_error = None

print("✅ Global services will be lazily initialized on first request (startup is fast!)")

async def ensure_services_initialized():
    """Lazy initialize services on first use to avoid startup timeout"""
    global rag_service, agent_service, lesson_generator_service, tts_engine, stt_engine, _services_initialized, _initialization_error
    global RAGService, ReasoningAgent, LessonGeneratorService, MAIN_SERVICES_AVAILABLE
    
    # Import services only when first needed
    if not MAIN_SERVICES_AVAILABLE:
        print("📦 Attempting to import RAG and agent services on first request...")
        try:
            from services.rag_service import RAGService as RAGServiceClass
            from services.agent_service import ReasoningAgent as ReasoningAgentClass
            from services.lesson_generator_service import LessonGeneratorService as LessonGeneratorServiceClass
            RAGService = RAGServiceClass
            ReasoningAgent = ReasoningAgentClass
            LessonGeneratorService = LessonGeneratorServiceClass
            MAIN_SERVICES_AVAILABLE = True
            print("✅ Main services imported successfully on first request")
        except Exception as e:
            print(f"❌ Could not import main services: {e}")
            traceback.print_exc()
            return  # Can't proceed without services
    
    async with _initialization_lock:
        if _services_initialized:
            return
        
        if _initialization_error:
            raise RuntimeError(f"Previous initialization failed: {_initialization_error}")
        
        print("🚀 Initializing services on first request...")
        try:
            print("  • Creating RAG service instance...")
            rag_service = RAGService()
            print("  • Initializing RAG service...")
            await rag_service.initialize()
            print("  ✅ RAG service initialized")
            
            # Initialize agent service with RAG service's LLM
            print("  • Initializing agent service...")
            agent_service = ReasoningAgent(
                llm_client=rag_service.llm,
                embedding_model=rag_service.embedding_model
            )
            print("  ✅ Agent service initialized")
            
            # Initialize lesson generator service with RAG service's LLM and RAG service
            print("  • Initializing lesson generator service...")
            lesson_generator_service = LessonGeneratorService(llm_client=rag_service.llm, rag_service=rag_service)
            print("  ✅ Lesson generator service initialized")
            
            # TTS engine
            try:
                sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'text-to-speech'))
                from tts_engine import TextToSpeech
                print("  • Initializing Text-to-Speech engine...")
                tts_engine = TextToSpeech("eng")
                print("  ✅ TTS engine initialized!")
            except ModuleNotFoundError as e:
                print(f"  ⚠️ Warning: TTS dependencies not installed: {e}")
                tts_engine = None
            except Exception as e:
                print(f"  ⚠️ Warning: TTS engine initialization failed: {e}")
                tts_engine = None
            
            # Initialize STT engine
            try:
                sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'speech-to-text'))
                from stt_engine import stt
                print("  • STT engine already initialized in stt_engine.py")
                stt_engine = stt
                print("  ✅ STT engine ready!")
            except ModuleNotFoundError as e:
                print(f"  ⚠️ Warning: STT dependencies not installed: {e}")
                stt_engine = None
            except Exception as e:
                print(f"  ⚠️ Warning: STT engine initialization failed: {e}")
                stt_engine = None
            
            _services_initialized = True
            print("✅ All services initialized successfully!")
        except Exception as e:
            _initialization_error = str(e)
            print(f"❌ Error initializing services: {e}")
            traceback.print_exc()
            raise

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Minimal lifespan - just start the app, services initialize on first request"""
    print("=" * 60)
    print("✅ FastAPI app started successfully!")
    print("=" * 60)
    if MAIN_SERVICES_AVAILABLE:
        print("📚 Main services available - services will initialize on first request")
    else:
        print("⚠️  Main services not available - app running in limited mode")
    print("=" * 60)
    print("🟢 App is now listening and ready to accept requests!")
    print("=" * 60)
    yield
    print("🔄 Shutting down...")

app = FastAPI(
    title="RAG Chat API",
    description="Advanced RAG-based Chat API",
    version="1.0.0",
    lifespan=lifespan
)

# Mount edu design generator router when available
if edu_design_router is not None:
    app.include_router(edu_design_router, prefix="/api/edu-design")

# Get CORS origins from environment or use defaults
cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []
cors_origins = [origin.strip() for origin in cors_origins if origin.strip()]

# Define all origins: production, staging, and local development
production_origins = [
    "https://eduwingz.vercel.app",  # Frontend
    "https://eduwingz-backend.onrender.com",  # Backend (for backend -> fastapi communication)
    "https://eduwingz-fastapi.onrender.com",  # FastAPI itself (for internal calls)
]

local_origins = [
    "http://localhost:8001",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

# Combine all origins: from env + production + local
all_origins = cors_origins + production_origins + local_origins
# Remove duplicates and empty strings
cors_origins = list(set(origin.strip() for origin in all_origins if origin.strip()))

print(f"🔐 CORS allowed origins ({len(cors_origins)} total):")
for origin in sorted(cors_origins):
    print(f"   ✅ {origin}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ============================================================================
# ROOT & HEALTH CHECK ENDPOINTS - MUST BE PUBLICLY ACCESSIBLE FOR RENDER
# ============================================================================
@app.get("/")
async def root():
    """Root endpoint - confirms app is running"""
    return {
        "message": "EduWingz FastAPI Backend",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint - no authentication required"""
    return {
        "status": "ok",
        "services_available": MAIN_SERVICES_AVAILABLE,
        "services_initialized": _services_initialized,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def api_status():
    """API status endpoint"""
    return {
        "status": "running",
        "main_services_available": MAIN_SERVICES_AVAILABLE,
        "main_services_initialized": _services_initialized,
        "tts_available": tts_engine is not None,
        "stt_available": stt_engine is not None,
        "initialization_error": _initialization_error
    }

@app.get("/api/health/chat")
async def health_check_chat():
    """Health check for chat service - tests LLM connectivity"""
    print("\n🏥 [HEALTH CHECK] Starting chat service health check...")
    
    health_status = {
        "service": "chat",
        "status": "unknown",
        "llm_backend": settings.LLM_BACKEND,
        "llm_model": None,
        "llm_available": False,
        "gemini_api_key_set": False,
        "openrouter_api_key_set": False,
        "services_initialized": _services_initialized,
        "tests": {},
        "errors": []
    }
    
    try:
        # Check if services are initialized
        if not _services_initialized:
            print("⏳ Services not initialized, initializing...")
            await ensure_services_initialized()
        
        # Check LLM setup
        print(f"🔍 Checking LLM backend: {settings.LLM_BACKEND}")
        health_status["llm_backend"] = settings.LLM_BACKEND
        
        if settings.LLM_BACKEND == "gemini":
            health_status["gemini_api_key_set"] = bool(settings.GEMINI_API_KEY)
            if not settings.GEMINI_API_KEY:
                health_status["errors"].append("GEMINI_API_KEY environment variable not set")
                print("❌ GEMINI_API_KEY not set!")
            else:
                print("✅ GEMINI_API_KEY is set")
        
        elif settings.LLM_BACKEND == "openrouter":
            health_status["openrouter_api_key_set"] = bool(settings.DEEPSEEK_OPEN_ROUTER_KEY)
            if not settings.DEEPSEEK_OPEN_ROUTER_KEY:
                health_status["errors"].append("DEEPSEEK_OPEN_ROUTER_KEY environment variable not set")
                print("❌ DEEPSEEK_OPEN_ROUTER_KEY not set!")
            else:
                print("✅ DEEPSEEK_OPEN_ROUTER_KEY is set")
        
        # Test LLM with a simple query
        if rag_service and rag_service.llm:
            print("🧪 Testing LLM with simple query...")
            try:
                from langchain_core.messages import SystemMessage, HumanMessage
                test_messages = [
                    SystemMessage(content="You are a helpful assistant."),
                    HumanMessage(content="Say 'Health check passed' in one sentence.")
                ]
                test_response = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: rag_service.llm.invoke(test_messages, max_tokens=100)
                )
                if test_response and hasattr(test_response, 'content'):
                    health_status["tests"]["llm_response"] = test_response.content[:100]
                    health_status["llm_available"] = True
                    print(f"✅ LLM test passed: {test_response.content[:50]}...")
                else:
                    health_status["errors"].append("LLM response missing content attribute")
                    print("❌ LLM response has no content")
            except Exception as e:
                error_msg = f"LLM test failed: {str(e)}"
                health_status["errors"].append(error_msg)
                print(f"❌ {error_msg}")
        else:
            health_status["errors"].append("RAG service or LLM not initialized")
            print("❌ RAG service or LLM not available")
        
        # Determine overall status
        if health_status["llm_available"]:
            health_status["status"] = "healthy"
        elif health_status["errors"]:
            health_status["status"] = "unhealthy"
        else:
            health_status["status"] = "degraded"
        
        print(f"📊 Health check result: {health_status['status']}")
        return health_status
        
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")
        import traceback
        traceback.print_exc()
        health_status["status"] = "error"
        health_status["errors"].append(f"Health check exception: {str(e)}")
        return health_status

# ============================================================================
# AUTHENTICATION
# ============================================================================
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    session_id: str
    document_ids: Optional[List[str]] = None

@app.post("/api/chat/process")
async def process_message(message: MessageCreate, user_id: int = Depends(verify_token)):
    """Process a chat message with intelligent agent routing
    
    The system will:
    1. First check if documents/RAG have relevant content
    2. If RAG results are insufficient (low relevance), automatically use search tools
    3. Activate other tools (code execution, etc.) as needed based on query type
    """
    try:
        print(f"\n🔵 [CHAT/PROCESS] Starting message processing...")
        print(f"   User ID: {user_id}")
        print(f"   Message: {message.content[:100]}...")
        print(f"   Session ID: {message.session_id}")
        
        print(f"⏳ [CHAT/PROCESS] Ensuring services initialized...")
        await ensure_services_initialized()
        print(f"✅ [CHAT/PROCESS] Services initialized successfully")
        
        # First, try to get RAG results
        print(f"🔍 [CHAT/PROCESS] Starting RAG search...")
        rag_response = await rag_service.chat(
            message.content, 
            message.session_id,
            document_ids=message.document_ids
        )
        print(f"✅ [CHAT/PROCESS] RAG response received")
        
        rag_score = rag_response.get("confidence_score", 0)
        
        print(f"📊 [RAG Score] Query: {message.content[:50]}... | Confidence: {rag_score:.2f}")
        
        # If RAG confidence is low (< 0.3), use agent with search tools
        if rag_score < 0.3:
            print(f"⚠️ [Agent Activation] Low RAG confidence ({rag_score:.2f}), activating agent with search tools...")
            
            # Use agent to search for better information
            # Max iterations set to 3 for balanced reasoning
            agent_response = await agent_service.reason_and_act(
                message=message.content,
                session_id=message.session_id,
                context=rag_response.get("answer", ""),
                enable_tools=True,
                max_iterations=3
            )
            
            # Extract tools used from reasoning chain
            tools_used = []
            if agent_response.get("reasoning_chain"):
                for step in agent_response["reasoning_chain"]:
                    if step.get("type") == "action":
                        tools_used.append(step.get("action"))
            
            print(f"✅ [CHAT/PROCESS] Agent response generated with {len(tools_used)} tools")
            return {
                "answer": agent_response.get("final_response", rag_response["answer"]),
                "is_incomplete": False,
                "context": rag_response.get("context", []),
                "source": "agent_with_tools",
                "tools_used": list(set(tools_used)),  # Remove duplicates
                "reasoning_steps": len(agent_response.get("reasoning_chain", [])),
                "iterations": agent_response.get("iterations", 0)
            }
        
        # If RAG is sufficient, return RAG response
        print(f"✅ [CHAT/PROCESS] Returning RAG response with confidence score: {rag_score:.2f}")
        return {
            "answer": rag_response["answer"],
            "is_incomplete": rag_response.get("is_incomplete", False),
            "context": rag_response.get("context", []),
            "source": "rag",
            "confidence_score": rag_score
        }
    
    except Exception as e:
        print(f"❌ ERROR in process_message: {str(e)}")
        print(f"   Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.post("/api/documents/process")
async def process_document(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    document_id: str = Form(...),
    user_id: int = Depends(verify_token)
):
    """Process a PDF document with session and document metadata"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    await ensure_services_initialized()
    
    file_path = f"media/uploads/{file.filename}"
    os.makedirs("media/uploads", exist_ok=True)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    success = await rag_service.process_document(file_path, session_id=session_id, document_id=document_id)
    return {"processed": success}

@app.post("/api/chat/clear/{session_id}")
async def clear_session(session_id: str, user_id: int = Depends(verify_token)):
    """Clear session history in RAG service"""
    rag_service.clear_session_history(session_id)
    return {"message": "Session history cleared"}

# ==================== LESSON GENERATION ENDPOINT ====================

class GenerateLessonRequest(BaseModel):
    grade: str
    subject: str
    topic: str
    attachments: Optional[List[dict]] = None


class TopicContentRequest(BaseModel):
    grade: str
    subject: str
    topic_title: str
    session_id: Optional[str] = None  # For learner profile lookup
    attachments: Optional[List[dict]] = None

@app.post("/api/lessons/generate")
async def generate_lesson(request: GenerateLessonRequest):
    """
    Generate lesson topics using Qwen LLM
    
    This endpoint runs the LLM on FastAPI server, not in Django!
    
    Args:
        grade: Grade level (e.g., "10", "11", "12")
        subject: Subject name (e.g., "Biology", "Mathematics")
        topic: Topic name (e.g., "Chemical Basis of Life")
        attachments: Optional list of educational materials
        
    Returns:
        Generated topics in JSON format
    """
    try:
        await ensure_services_initialized()
        print(f"📚 [API] Received lesson generation request:")
        print(f"   Grade: {request.grade}")
        print(f"   Subject: {request.subject}")
        print(f"   Topic: {request.topic}")
        
        # Call lesson generator service
        result = lesson_generator_service.generate_topics(
            grade=request.grade,
            subject=request.subject,
            topic=request.topic,
            attachments=request.attachments
        )
        
        if result['success']:
            print(f"✅ [API] Generated {len(result['topics'])} topics")
            return {
                "success": True,
                "topics": result['topics'],
                "message": result['message']
            }
        else:
            print(f"❌ [API] Failed to generate topics: {result['message']}")
            raise HTTPException(
                status_code=500,
                detail=result['message']
            )
            
    except Exception as e:
        print(f"❌ [API] Error in generate_lesson endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error generating lesson: {str(e)}"
        )


@app.post("/api/lessons/generate_content")
async def generate_topic_content(request: TopicContentRequest):
    """Generate adaptive content for a single topic using ILS learning profile."""
    try:
        await ensure_services_initialized()
        print(f"📚 [API] Received topic content request: {request.topic_title} (Grade {request.grade} - {request.subject})")
        
        # Get learning profile if session_id provided
        learning_profile = None
        if request.session_id:
            learning_profile = rag_service.get_or_create_learning_profile(request.session_id)
            print(f"   👤 Using learning profile for session: {request.session_id}")
        
        # Generate content with optional ILS adaptation
        result = lesson_generator_service.generate_content_for_topic(
            grade=request.grade,
            subject=request.subject,
            topic_title=request.topic_title,
            attachments=request.attachments,
            learning_profile=learning_profile
        )

        if result.get('success'):
            return {
                'success': True,
                'content': result.get('content', ''),
                'message': result.get('message', '')
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('message', 'Failed to generate content'))

    except Exception as e:
        print(f"❌ [API] Error in generate_topic_content endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ========================================================================

class QuestionnaireSubmit(BaseModel):
    session_id: str
    active_reflective: int = Field(..., ge=-11, le=11)
    sensing_intuitive: int = Field(..., ge=-11, le=11)
    visual_verbal: int = Field(..., ge=-11, le=11)
    sequential_global: int = Field(..., ge=-11, le=11)

@app.post("/api/learning/questionnaire")
async def submit_questionnaire(
    questionnaire: QuestionnaireSubmit,
    user_id: int = Depends(verify_token)
):
    """Submit ILS questionnaire responses and update learning profile"""
    try:
        await ensure_services_initialized()
        print(f"📝 [Questionnaire] Received questionnaire submission for session: {questionnaire.session_id}")
        learning_profile = rag_service.get_or_create_learning_profile(questionnaire.session_id)
        
        questionnaire_data = {
            'active_reflective': questionnaire.active_reflective,
            'sensing_intuitive': questionnaire.sensing_intuitive,
            'visual_verbal': questionnaire.visual_verbal,
            'sequential_global': questionnaire.sequential_global
        }
        
        learning_profile.set_questionnaire_data(questionnaire_data)
        
        # Save the updated profile
        rag_service._save_learning_profiles()
        
        # Get the updated learning style
        learning_style = learning_profile.get_learning_style()
        
        return {
            "success": True,
            "message": "Questionnaire submitted successfully",
            "learning_style": learning_style,
            "dimensions": learning_profile.dimensions
        }
    except Exception as e:
        print(f"❌ [Questionnaire] Error submitting questionnaire: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing questionnaire: {str(e)}")

@app.get("/api/learning/profile/{session_id}")
async def get_learning_profile(
    session_id: str,
    user_id: int = Depends(verify_token)
):
    """Get learning profile for a session"""
    try:
        await ensure_services_initialized()
        learning_profile = rag_service.get_or_create_learning_profile(session_id)
        learning_style = learning_profile.get_learning_style()
        
        return {
            "session_id": session_id,
            "dimensions": learning_profile.dimensions,
            "learning_style": learning_style,
            "total_interactions": learning_profile.total_interactions,
            "questionnaire_completed": learning_profile.questionnaire_completed,
            "questionnaire_timestamp": learning_profile.questionnaire_timestamp
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving profile: {str(e)}")

class ContinueMessage(BaseModel):
    session_id: str

@app.post("/api/chat/continue")
async def continue_response(
    continue_msg: ContinueMessage,
    user_id: int = Depends(verify_token)
):
    """Continue generating response from where it left off"""
    try:
        await ensure_services_initialized()
        print(f"🔄 [Continue] Continuing response for session: {continue_msg.session_id}")
        
        # Get the last assistant message from history
        history = rag_service.get_session_history(continue_msg.session_id)
        if not history.messages or len(history.messages) == 0:
            raise HTTPException(status_code=400, detail="No conversation history found")
        
        # Get the last assistant message (the incomplete one)
        last_assistant_msg = None
        for msg in reversed(history.messages):
            if msg.type == "ai":
                last_assistant_msg = msg
                break
        
        if not last_assistant_msg:
            raise HTTPException(status_code=400, detail="No assistant message found to continue")
        
        print(f"   📝 Last assistant message length: {len(last_assistant_msg.content)} chars")
        
        # Build messages for continuation (include all history + continuation prompt)
        lc_messages = []
        for msg in history.messages:
            if msg.type == "human":
                lc_messages.append(HumanMessage(content=msg.content))
            elif msg.type == "ai":
                lc_messages.append(AIMessage(content=msg.content))
        
        # Add a continuation prompt asking to continue from the last response
        continuation_prompt = "Please continue your previous response from where you left off. Complete your thought."
        lc_messages.append(HumanMessage(content=continuation_prompt))
        
        print(f"   🤖 Generating continuation (max_tokens: {settings.MAX_TOKENS})")
        
        # Generate continuation
        continuation = await asyncio.get_event_loop().run_in_executor(
            None, lambda: rag_service.llm.invoke(lc_messages, max_tokens=settings.MAX_TOKENS)
        )
        
        # Combine the original response with continuation
        combined_response = last_assistant_msg.content + " " + continuation.content
        
        # Update the last assistant message in history
        # Find the index of the last assistant message and update it
        for i in range(len(history.messages) - 1, -1, -1):
            if history.messages[i].type == "ai":
                history.messages[i].content = combined_response
                break
        
        # Check if still incomplete
        is_incomplete = rag_service._is_response_incomplete(combined_response)
        
        print(f"✅ [Continue] Continuation generated (total length: {len(combined_response)} chars, incomplete: {is_incomplete})")
        
        return {
            "answer": continuation.content,  # Return only the continuation part
            "full_answer": combined_response,  # Return the full combined answer
            "is_incomplete": is_incomplete
        }
    except Exception as e:
        print(f"❌ [Continue] Error continuing response: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error continuing response: {str(e)}")

# ===== AGENT-ENHANCED ENDPOINTS =====

class AgentChatRequest(BaseModel):
    """Request for agent-based chat"""
    content: str = Field(..., min_length=1)
    session_id: str
    document_ids: Optional[List[str]] = None
    use_adaptive_learning: bool = True
    enable_tools: bool = True
    max_iterations: int = 5

@app.post("/api/agent/chat")
async def agent_chat(
    request: AgentChatRequest,
    user_id: int = Depends(verify_token)
):
    """
    Enhanced chat with agent reasoning and tool integration
    
    The agent can:
    - Search the web (Google Serper, DuckDuckGo)
    - Query knowledge bases (Wikipedia, ArXiv, Wikidata)
    - Execute code (Riza Code Interpreter)
    - Browse web pages (Playwright)
    - Access GitHub, YouTube, Weather, and create visualizations
    - Combine RAG with reasoning for comprehensive answers
    """
    try:
        await ensure_services_initialized()
        print(f"\n📡 Agent Chat Request received")
        
        response = await rag_service.chat_with_agent(
            message=request.content,
            session_id=request.session_id,
            document_ids=request.document_ids,
            use_adaptive_learning=request.use_adaptive_learning,
            enable_tools=request.enable_tools,
            max_iterations=request.max_iterations
        )
        
        return response
    
    except Exception as e:
        print(f"❌ Agent chat error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Agent chat error: {str(e)}")

@app.get("/api/agent/tools")
async def get_available_tools(user_id: int = Depends(verify_token)):
    """Get list of all available tools and their status"""
    try:
        await ensure_services_initialized()
        tools_info = await rag_service.get_available_tools()
        return {
            "status": "success",
            "tools": tools_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tools: {str(e)}")

@app.get("/api/agent/memory/{session_id}")
async def get_agent_memory(
    session_id: str,
    user_id: int = Depends(verify_token)
):
    """Get agent's reasoning memory for a session"""
    try:
        await ensure_services_initialized()
        memory_summary = rag_service.get_agent_memory_summary(session_id)
        return {
            "status": "success",
            "memory": memory_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching agent memory: {str(e)}")

@app.post("/api/agent/memory/{session_id}/clear")
async def clear_agent_memory(
    session_id: str,
    user_id: int = Depends(verify_token)
):
    """Clear agent's memory for a session"""
    try:
        await ensure_services_initialized()
        rag_service.clear_agent_memory(session_id)
        return {
            "status": "success",
            "message": f"Agent memory cleared for session {session_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing agent memory: {str(e)}")

# ===== TEXT-TO-SPEECH ENDPOINTS =====

class TextToSpeechRequest(BaseModel):
    """Request for text-to-speech conversion"""
    text: str = Field(..., min_length=1)
    language: str = Field(default="English")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)

@app.post("/api/tts/generate")
async def generate_speech(
    request: TextToSpeechRequest,
    user_id: int = Depends(verify_token)
):
    """Generate audio from text using Text-to-Speech engine"""
    try:
        await ensure_services_initialized()
        if not tts_engine:
            raise HTTPException(
                status_code=503,
                detail="TTS engine not available"
            )
        
        print(f"📢 [TTS] Generating speech for text: {request.text[:50]}...")
        
        # Generate audio
        audio_data, sample_rate = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: tts_engine.speak(request.text)
        )
        
        # Convert audio to base64 for transmission
        import soundfile as sf
        
        # Create bytes buffer
        audio_buffer = io.BytesIO()
        sf.write(audio_buffer, audio_data, sample_rate, format='WAV')
        audio_buffer.seek(0)
        
        # Convert to base64
        audio_bytes = audio_buffer.read()
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        print(f"✅ [TTS] Audio generated successfully ({len(audio_bytes)} bytes)")
        
        return {
            "audio": audio_base64,
            "sample_rate": sample_rate,
            "format": "wav",
            "text": request.text,
            "language": request.language
        }
    
    except Exception as e:
        print(f"❌ [TTS] Error generating speech: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

@app.post("/api/tts/generate-stream")
async def generate_speech_stream(
    request: TextToSpeechRequest,
    user_id: int = Depends(verify_token)
):
    """Generate audio from text and stream as file (streaming response)"""
    try:
        await ensure_services_initialized()
        if not tts_engine:
            raise HTTPException(
                status_code=503,
                detail="TTS engine not available"
            )
        
        print(f"📢 [TTS-Stream] Generating speech for text: {request.text[:50]}...")
        
        # Generate audio
        audio_data, sample_rate = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: tts_engine.speak(request.text)
        )
        
        # Create bytes buffer
        import soundfile as sf
        audio_buffer = io.BytesIO()
        sf.write(audio_buffer, audio_data, sample_rate, format='WAV')
        audio_buffer.seek(0)
        
        print(f"✅ [TTS-Stream] Audio generated successfully")
        
        return StreamingResponse(
            audio_buffer,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=speech.wav"
            }
        )
    
    except Exception as e:
        print(f"❌ [TTS-Stream] Error generating speech: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

# ===== SPEECH-TO-TEXT ENDPOINTS =====

class SpeechToTextRequest(BaseModel):
    """Request for speech-to-text conversion"""
    # Audio data can be sent as base64 or multipart form-data
    pass

@app.post("/api/stt/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    user_id: int = Depends(verify_token)
):
    """Transcribe audio file to text using Speech-to-Text engine"""
    try:
        await ensure_services_initialized()
        if not stt_engine:
            raise HTTPException(
                status_code=503,
                detail="STT engine not available"
            )
        
        # Save uploaded file temporarily
        import tempfile
        import shutil
        
        temp_dir = tempfile.mkdtemp()
        temp_file_path = os.path.join(temp_dir, file.filename)
        
        try:
            # Write uploaded file to disk
            with open(temp_file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            print(f"🎤 [STT] Transcribing audio file: {file.filename}")
            
            # Transcribe using STT engine
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: stt_engine.transcribe(temp_file_path)
            )
            
            # Extract text and segments
            text = result.get("text", "").strip()
            segments = result.get("chunks") or result.get("segments") or []
            
            print(f"✅ [STT] Transcription completed: {len(text)} characters")
            
            return {
                "text": text,
                "segments": segments,
                "filename": file.filename,
                "language": result.get("detected_language", "unknown"),
                "status": "success"
            }
        
        finally:
            # Clean up temp files
            shutil.rmtree(temp_dir, ignore_errors=True)
    
    except Exception as e:
        print(f"❌ [STT] Error transcribing audio: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")

@app.post("/api/stt/transcribe-base64")
async def transcribe_audio_base64(
    audio_base64: str = Form(...),
    filename: str = Form(default="audio.wav"),
    user_id: int = Depends(verify_token)
):
    """Transcribe audio from base64 encoded data"""
    try:
        await ensure_services_initialized()
        if not stt_engine:
            raise HTTPException(
                status_code=503,
                detail="STT engine not available"
            )
        
        import tempfile
        import shutil
        
        temp_dir = tempfile.mkdtemp()
        temp_file_path = os.path.join(temp_dir, filename)
        
        try:
            # Decode base64 and write to file
            audio_bytes = base64.b64decode(audio_base64)
            with open(temp_file_path, "wb") as f:
                f.write(audio_bytes)
            
            print(f"🎤 [STT-Base64] Transcribing audio: {filename} ({len(audio_bytes)} bytes)")
            
            # Transcribe using STT engine
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: stt_engine.transcribe(temp_file_path)
            )
            
            # Extract text and segments
            text = result.get("text", "").strip()
            segments = result.get("chunks") or result.get("segments") or []
            
            print(f"✅ [STT-Base64] Transcription completed: {len(text)} characters")
            
            return {
                "text": text,
                "segments": segments,
                "filename": filename,
                "language": result.get("detected_language", "unknown"),
                "status": "success"
            }
        
        finally:
            # Clean up temp files
            shutil.rmtree(temp_dir, ignore_errors=True)
    
    except Exception as e:
        print(f"❌ [STT-Base64] Error transcribing audio: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")

if __name__ == "__main__":
    try:
        port = int(os.getenv("PORT", 8000))
        print(f"🚀 Starting Uvicorn server on 0.0.0.0:{port}")
        uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        traceback.print_exc()
        sys.exit(1)