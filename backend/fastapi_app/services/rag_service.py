# import os
# import asyncio
# from typing import Dict, List
# import numpy as np
# import faiss
# import pickle
# from dotenv import load_dotenv
# from langchain_community.document_loaders import PyPDFLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_community.chat_message_histories import ChatMessageHistory
# from langchain_core.chat_history import BaseChatMessageHistory
# from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
# from llm_model import LLM_Model
# from config import settings

# class FAISSVectorStore:
#     def __init__(self, embedding_model):
#         self.embedding_model = embedding_model
#         self.index = None
#         self.documents = []
#         self.dimension = 768  # embedding dimension for all-mpnet-base-v2

#     def add_documents(self, docs: List[str], metadatas: List[Dict] = None):
#         if not docs:
#             return
#         embeddings = self.embedding_model.embed_documents(docs)
#         embeddings_np = np.array(embeddings).astype("float32")
#         if self.index is None:
#             self.index = faiss.IndexFlatIP(self.dimension)
#         faiss.normalize_L2(embeddings_np)
#         self.index.add(embeddings_np)
#         for i, doc in enumerate(docs):
#             self.documents.append(
#                 {"content": doc, "metadata": metadatas[i] if metadatas else {}}
#             )

#     def similarity_search(self, query: str, k: int = 5) -> List[Dict]:
#         if self.index is None or len(self.documents) == 0:
#             return []
#         query_embedding = self.embedding_model.embed_query(query)
#         query_np = np.array([query_embedding]).astype("float32")
#         faiss.normalize_L2(query_np)
#         scores, indices = self.index.search(query_np, min(k, len(self.documents)))
#         results = []
#         for score, idx in zip(scores[0], indices[0]):
#             if idx != -1:
#                 results.append(
#                     {
#                         **self.documents[idx],
#                         "score": float(score),
#                     }
#                 )
#         return results

#     def save_index(self, path: str):
#         if self.index is not None:
#             faiss.write_index(self.index, f"{path}.faiss")
#             with open(f"{path}.pkl", "wb") as f:
#                 pickle.dump(self.documents, f)

#     def load_index(self, path: str):
#         try:
#             if os.path.exists(f"{path}.faiss") and os.path.exists(f"{path}.pkl"):
#                 self.index = faiss.read_index(f"{path}.faiss")
#                 with open(f"{path}.pkl", "rb") as f:
#                     self.documents = pickle.load(f)
#                 return True
#         except Exception as e:
#             print(f"Error loading index: {e}")
#         return False

# class RAGService:
#     def __init__(self):
#         load_dotenv()
#         self.llm = None
#         self.embedding_model = None
#         self.vectorstore = None
#         self.session_histories = {}
#         self._initialized = False

#     async def initialize(self):
#         if self._initialized:
#             return
#         try:
#             self.llm = LLM_Model().get_client()
#             self.embedding_model = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
#             self.vectorstore = FAISSVectorStore(self.embedding_model)
#             self.vectorstore.load_index("data/vectorstore")
#             self._initialized = True
#             print("✅ RAG Service initialized successfully!")
#         except Exception as e:
#             print(f"❌ Error initializing RAG service: {e}")
#             raise

#     async def process_document(self, file_path: str) -> bool:
#         try:
#             loader = PyPDFLoader(file_path)
#             docs = await asyncio.get_event_loop().run_in_executor(None, loader.load)
#             text_splitter = RecursiveCharacterTextSplitter(
#                 chunk_size=settings.CHUNK_SIZE,
#                 chunk_overlap=settings.CHUNK_OVERLAP,
#             )
#             chunks = text_splitter.split_documents(docs)
#             texts = [chunk.page_content for chunk in chunks]
#             metadatas = [chunk.metadata for chunk in chunks]
#             self.vectorstore.add_documents(texts, metadatas)
#             os.makedirs("data", exist_ok=True)
#             self.vectorstore.save_index("data/vectorstore")
#             print(f"✅ Processed document: {file_path}")
#             return True
#         except Exception as e:
#             print(f"❌ Error processing document {file_path}: {e}")
#             return False

#     def get_session_history(self, session_id: str) -> BaseChatMessageHistory:
#         if session_id not in self.session_histories:
#             self.session_histories[session_id] = ChatMessageHistory()
#         return self.session_histories[session_id]

#     def clear_session_history(self, session_id: str):
#         if session_id in self.session_histories:
#             del self.session_histories[session_id]

#     async def chat(self, message: str, session_id: str) -> Dict:
#         try:
#             if not self._initialized:
#                 await self.initialize()
#             # Retrieve relevant context from FAISS
#             context_docs = self.vectorstore.similarity_search(message, k=settings.TOP_K)
#             context = "\n\n".join([doc["content"] for doc in context_docs])
#             history = self.get_session_history(session_id)
#             # Build langchain messages
#             system_content = (
#                 "You are an intelligent chatbot with strong reasoning abilities. "
#                 "Use the following context to answer the question. Think step by step and provide clear reasoning. "
#                 "If you don't know the answer based on the context, say that you don't know.\n\n"
#                 f"Context:\n{context}\n\n"
#             )
#             lc_messages = [SystemMessage(content=system_content)]
#             for msg in history.messages:
#                 if msg.type == "human":
#                     lc_messages.append(HumanMessage(content=msg.content))
#                 else:
#                     lc_messages.append(AIMessage(content=msg.content))
#             lc_messages.append(HumanMessage(content=message))
#             # Run the LLM
#             response = await asyncio.get_event_loop().run_in_executor(
#                 None, lambda: self.llm.invoke(lc_messages)
#             )
#             # Save to history
#             history.add_user_message(message)
#             history.add_ai_message(response.content)
#             return {
#                 "answer": response.content,
#                 "context": [
#                     {
#                         "content": doc["content"][:200] + "..." if len(doc["content"]) > 200 else doc["content"],
#                         "metadata": doc["metadata"],
#                         "score": doc["score"],
#                     }
#                     for doc in context_docs
#                 ],
#             }
#         except Exception as e:
#             print(f"❌ Error in chat processing: {e}")
#             import traceback
#             traceback.print_exc()
#             return {"answer": f"I'm sorry, I encountered an error: {str(e)}", "context": []}

# services/rag_service.py (updated)

import os
import asyncio
from typing import Dict, List, Optional
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from llm_model import LLM_Model
from config import settings
from adaptive_learning import ILSLearningProfile, AdaptiveSystemPromptGenerator, AdaptiveFAISSVectorStore
from .agent_service import ReasoningAgent
import json
import traceback


class RAGService:
    def __init__(self):
        load_dotenv()
        self.llm = None
        self.embedding_model = None
        self.vectorstore = None
        self.session_histories = {}
        self.learning_profiles = {}  # session_id -> ILSLearningProfile
        self.prompt_generator = AdaptiveSystemPromptGenerator()
        self.agent = None  # Will be initialized with RAG service
        self._initialized = False

    async def initialize(self):
        if self._initialized:
            return
        try:
            self.llm = LLM_Model().get_client()
            self.embedding_model = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
            self.vectorstore = AdaptiveFAISSVectorStore(self.embedding_model)
            self.vectorstore.load_index("data/vectorstore")
            
            # Initialize reasoning agent
            self.agent = ReasoningAgent(self.llm, self.embedding_model)
            
            # Load learning profiles if they exist
            self._load_learning_profiles()
            
            self._initialized = True
            print("✅ RAG Service initialized successfully with ILS adaptive learning and Agent!")
        except Exception as e:
            print(f"❌ Error initializing RAG service: {e}")
            raise

    def _load_learning_profiles(self):
        """Load saved learning profiles"""
        profile_path = "data/learning_profiles.json"
        if os.path.exists(profile_path):
            try:
                with open(profile_path, 'r') as f:
                    profiles_data = json.load(f)
                for session_id, profile_data in profiles_data.items():
                    self.learning_profiles[session_id] = ILSLearningProfile.from_dict(profile_data)
                print(f"✅ Loaded {len(self.learning_profiles)} learning profiles")
            except Exception as e:
                print(f"⚠️ Could not load learning profiles: {e}")

    def _save_learning_profiles(self):
        """Save learning profiles to disk"""
        os.makedirs("data", exist_ok=True)
        profile_path = "data/learning_profiles.json"
        try:
            profiles_data = {
                session_id: profile.to_dict() 
                for session_id, profile in self.learning_profiles.items()
            }
            with open(profile_path, 'w') as f:
                json.dump(profiles_data, f, indent=2)
        except Exception as e:
            print(f"⚠️ Could not save learning profiles: {e}")

    def get_or_create_learning_profile(self, session_id: str) -> ILSLearningProfile:
        """Get existing profile or create new one"""
        if session_id not in self.learning_profiles:
            self.learning_profiles[session_id] = ILSLearningProfile(session_id)
        return self.learning_profiles[session_id]

    async def process_document(self, file_path: str, session_id: str = None, document_id: str = None) -> bool:
        try:
            loader = PyPDFLoader(file_path)
            docs = await asyncio.get_event_loop().run_in_executor(None, loader.load)
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=settings.CHUNK_SIZE,
                chunk_overlap=settings.CHUNK_OVERLAP,
            )
            chunks = text_splitter.split_documents(docs)
            texts = [chunk.page_content for chunk in chunks]
            # Add session_id and document_id to metadata
            metadatas = []
            for chunk in chunks:
                metadata = chunk.metadata.copy()
                if session_id:
                    metadata['session_id'] = session_id
                if document_id:
                    metadata['document_id'] = document_id
                metadatas.append(metadata)
            self.vectorstore.add_documents(texts, metadatas)
            os.makedirs("data", exist_ok=True)
            self.vectorstore.save_index("data/vectorstore")
            print(f"✅ Processed document: {file_path} (session_id: {session_id}, document_id: {document_id})")
            print(f"   📊 Added {len(texts)} chunks to vectorstore. Total documents in store: {len(self.vectorstore.documents)}")
            # Verify metadata was added correctly
            if len(self.vectorstore.documents) > 0:
                last_doc = self.vectorstore.documents[-1]
                print(f"   🔍 Last document metadata check: session_id={last_doc.get('metadata', {}).get('session_id')}, document_id={last_doc.get('metadata', {}).get('document_id')}")
            return True
        except Exception as e:
            print(f"❌ Error processing document {file_path}: {e}")
            traceback.print_exc()
            return False

    def get_session_history(self, session_id: str) -> BaseChatMessageHistory:
        if session_id not in self.session_histories:
            self.session_histories[session_id] = ChatMessageHistory()
        return self.session_histories[session_id]

    def clear_session_history(self, session_id: str):
        if session_id in self.session_histories:
            del self.session_histories[session_id]
    
    def _is_response_incomplete(self, response_text: str) -> bool:
        """Check if response appears to be incomplete/cut off"""
        if not response_text or len(response_text.strip()) == 0:
            return False
        
        # Remove trailing whitespace
        text = response_text.strip()
        
        # Check if ends with incomplete sentence (no punctuation)
        # Common incomplete patterns:
        # - Ends without sentence-ending punctuation (. ! ?)
        # - Ends mid-word (unlikely but possible)
        # - Ends with comma or semicolon (might be incomplete)
        # - Very short response relative to context
        
        # Check for sentence-ending punctuation
        ends_with_punctuation = text[-1] in '.!?。！？'
        
        # Check if ends with common incomplete patterns
        incomplete_patterns = [',', ';', ':', '-', '—', '…']
        ends_with_incomplete = text[-1] in incomplete_patterns
        
        # Check if response is suspiciously short (less than 50 chars might be incomplete)
        is_very_short = len(text) < 50
        
        # If it doesn't end with proper punctuation and isn't very short, might be incomplete
        # But also check if it seems like it was cut off mid-sentence
        last_sentence = text.split('.')[-1].split('!')[-1].split('?')[-1].strip()
        if last_sentence and len(last_sentence) > 0:
            # If last "sentence" is very long without punctuation, might be cut off
            if len(last_sentence) > 200 and not ends_with_punctuation:
                return True
        
        # If ends with incomplete pattern and response is substantial, likely incomplete
        if ends_with_incomplete and len(text) > 100:
            return True
        
        # If response doesn't end with punctuation and is substantial, might be incomplete
        if not ends_with_punctuation and len(text) > 100 and not is_very_short:
            # But allow if it ends with common non-sentence endings like lists
            if not text[-1].isdigit() and text[-1] not in ')】」':
                return True
        
        return False

    def _calculate_confidence_score(self, context_docs: List[Dict], context: str) -> float:
        """
        Calculate confidence score for RAG response
        
        Score factors:
        - Number of relevant documents found (max 1.0)
        - Average relevance scores of documents
        - Amount of context available
        
        Returns score between 0.0 and 1.0
        """
        if not context_docs or not context:
            return 0.0
        
        # Factor 1: Number of documents (normalized to 0-0.3)
        doc_count_score = min(len(context_docs) / 5.0, 1.0) * 0.3
        
        # Factor 2: Average relevance scores (0-0.4)
        avg_score = sum([doc.get("score", 0) for doc in context_docs]) / len(context_docs)
        relevance_score = avg_score * 0.4
        
        # Factor 3: Context length (more context = more confidence, 0-0.3)
        context_length_score = min(len(context) / 2000.0, 1.0) * 0.3
        
        total_score = doc_count_score + relevance_score + context_length_score
        return min(total_score, 1.0)

    async def chat(
        self, 
        message: str, 
        session_id: str,
        document_ids: Optional[List[str]] = None,
        use_adaptive_learning: bool = True
    ) -> Dict:
        """
        Enhanced chat with adaptive learning capabilities
        
        Args:
            message: User's message
            session_id: Session identifier
            use_adaptive_learning: Whether to use ILS-based adaptation (default: True)
        """
        try:
            if not self._initialized:
                await self.initialize()
            
            # Get or create learning profile
            print(f"👤 [RAG Service] Getting/creating learning profile for session: {session_id}")
            learning_profile = self.get_or_create_learning_profile(session_id)
            
            # Analyze user message for learning patterns
            if use_adaptive_learning:
                print(f"🧠 [RAG Service] Using adaptive learning - analyzing message patterns")
                indicators = learning_profile.analyze_message_patterns(message)
                learning_profile.update_from_interaction(indicators)
                learning_style = learning_profile.get_learning_style()
                print(f"✅ [RAG Service] Learning style determined: {learning_style}")
            else:
                print(f"ℹ️ [RAG Service] Adaptive learning disabled")
                learning_style = {}
            
            # Retrieve relevant context with adaptive ranking
            # Filter by session_id and document_ids if provided
            print(f"🔍 Searching for context - session_id: {session_id}, document_ids: {document_ids}")
            
            if use_adaptive_learning and learning_style:
                context_docs = self.vectorstore.adaptive_similarity_search(
                    message, learning_style, k=settings.TOP_K,
                    session_id=session_id, document_ids=document_ids
                )
            else:
                context_docs = self.vectorstore.similarity_search(
                    message, k=settings.TOP_K,
                    session_id=session_id, document_ids=document_ids
                )
            
            print(f"📄 Found {len(context_docs)} context documents")
            if len(context_docs) == 0:
                print(f"⚠️ No documents found! This might mean:")
                print(f"   - Documents haven't been processed yet")
                print(f"   - Documents don't have matching session_id or document_id metadata")
                print(f"   - Vectorstore might be empty")
            
            # Prioritize content from uploaded documents
            # Separate documents by priority (uploaded vs other)
            uploaded_docs_content = []
            other_docs_content = []
            
            for doc in context_docs:
                metadata = doc.get("metadata", {})
                doc_id = metadata.get("document_id")
                # Check if this document is in the provided document_ids (uploaded document)
                if document_ids and len(document_ids) > 0 and doc_id in document_ids:
                    uploaded_docs_content.append(doc["content"])
                    print(f"✅ Found uploaded document content (doc_id: {doc_id})")
                else:
                    other_docs_content.append(doc["content"])
                    print(f"📚 Found other document content (doc_id: {doc_id})")
            
            # Build context with priority: uploaded documents first, then others
            if uploaded_docs_content:
                primary_context = "\n\n".join(uploaded_docs_content)
                if other_docs_content:
                    secondary_context = "\n\n".join(other_docs_content)
                    context = f"PRIMARY CONTEXT (from uploaded documents - use this as the main source):\n{primary_context}\n\nADDITIONAL CONTEXT (for reference only):\n{secondary_context}"
                else:
                    context = primary_context
            elif context_docs:
                # If no uploaded docs but we have context, use all of it
                context = "\n\n".join([doc["content"] for doc in context_docs])
            else:
                # No context found - this is a problem
                context = ""
                print(f"❌ ERROR: No context documents found for query: {message}")
                print(f"   This means the document might not be processed or indexed correctly")
            
            # Generate adaptive system prompt
            print(f"📝 [RAG Service] Generating system prompt")
            if not context:
                # No context available - tell user the document might not be processed
                print(f"   ⚠️ No context available - using fallback prompt")
                system_content = (
                    "You are an intelligent chatbot. "
                    "The user is asking about a document, but the document content is not available in the system. "
                    "This might mean the document hasn't been processed yet or there was an error processing it. "
                    "Please inform the user that the document needs to be processed first, or ask them to re-upload it."
                )
            elif use_adaptive_learning:
                print(f"   🎨 Using adaptive learning prompt generator")
                system_content = self.prompt_generator.generate_prompt(learning_profile, context)
            else:
                print(f"   📄 Using standard prompt")
                priority_instruction = ""
                if document_ids and len(document_ids) > 0:
                    priority_instruction = "IMPORTANT: Base your answer primarily on the PRIMARY CONTEXT section (from the uploaded documents). Use the ADDITIONAL CONTEXT only for supplementary information if needed. "
                
                system_content = (
                    "You are an intelligent chatbot with strong reasoning abilities. "
                    f"{priority_instruction}"
                    "Use the following context to answer the question. Think step by step and provide clear reasoning. "
                    "If you don't know the answer based on the context, say that you don't know.\n\n"
                    f"Context:\n{context}\n\n"
                )
            
            # Build conversation history
            print(f"💬 [RAG Service] Building conversation history")
            history = self.get_session_history(session_id)
            print(f"   📚 History contains {len(history.messages)} previous messages")
            lc_messages = [SystemMessage(content=system_content)]
            
            for msg in history.messages:
                if msg.type == "human":
                    lc_messages.append(HumanMessage(content=msg.content))
                else:
                    lc_messages.append(AIMessage(content=msg.content))
            
            lc_messages.append(HumanMessage(content=message))
            print(f"   📝 Total messages to LLM: {len(lc_messages)}")
            
            # Run the LLM
            print(f"🤖 [RAG Service] Invoking LLM to generate response (max_tokens: {settings.MAX_TOKENS})")
            response = await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.llm.invoke(lc_messages, max_tokens=settings.MAX_TOKENS)
            )
            print(f"✅ [RAG Service] LLM response generated (length: {len(response.content)} chars)")
            
            # Check if response seems incomplete (ends with incomplete sentence or seems cut off)
            is_incomplete = self._is_response_incomplete(response.content)
            if is_incomplete:
                print(f"⚠️ [RAG Service] Response appears incomplete - may need continuation")
            
            # Save to history
            history.add_user_message(message)
            history.add_ai_message(response.content)
            print(f"💾 [RAG Service] Conversation history updated")
            
            # Save learning profiles periodically
            if learning_profile.total_interactions % 5 == 0:
                print(f"💾 [RAG Service] Saving learning profiles (periodic save)")
                self._save_learning_profiles()
            
            # Calculate confidence score
            confidence_score = self._calculate_confidence_score(context_docs, context)
            print(f"📊 [Confidence Score] {confidence_score:.2f} for query: {message[:50]}...")
            
            return {
                "answer": response.content,
                "is_incomplete": is_incomplete,
                "context": [
                    {
                        "content": doc["content"][:200] + "..." if len(doc["content"]) > 200 else doc["content"],
                        "metadata": doc.get("metadata", {}),
                        "score": doc.get("combined_score", doc.get("score", 0)),
                    }
                    for doc in context_docs
                ],
                "confidence_score": confidence_score,
                "learning_style": learning_style if use_adaptive_learning else None,
                "learning_profile_summary": {
                    "dimensions": learning_profile.dimensions,
                    "total_interactions": learning_profile.total_interactions,
                    "detected_style": learning_style
                } if use_adaptive_learning else None
            }
            
        except Exception as e:
            print(f"❌ Error in chat processing: {e}")
            traceback.print_exc()
            return {
                "answer": f"I'm sorry, I encountered an error: {str(e)}", 
                "context": [],
                "learning_style": None
            }

    def get_learning_profile_summary(self, session_id: str) -> Optional[Dict]:
        """Get detailed summary of user's learning profile"""
        if session_id in self.learning_profiles:
            profile = self.learning_profiles[session_id]
            return {
                "session_id": session_id,
                "dimensions": profile.dimensions,
                "learning_style": profile.get_learning_style(),
                "total_interactions": profile.total_interactions,
                "recent_history": profile.interaction_history[-5:]  # Last 5 interactions
            }
        return None

    def reset_learning_profile(self, session_id: str):
        """Reset learning profile for a session"""
        if session_id in self.learning_profiles:
            del self.learning_profiles[session_id]
            self._save_learning_profiles()
            print(f"✅ Reset learning profile for session: {session_id}")
    
    async def chat_with_agent(
        self,
        message: str,
        session_id: str,
        document_ids: Optional[List[str]] = None,
        use_adaptive_learning: bool = True,
        enable_tools: bool = True,
        max_iterations: int = 5
    ) -> Dict:
        """
        Enhanced chat with agent reasoning and tool usage
        
        Args:
            message: User's message
            session_id: Session identifier
            document_ids: Optional list of document IDs to prioritize
            use_adaptive_learning: Whether to use ILS-based adaptation
            enable_tools: Whether to enable tool usage
            max_iterations: Maximum reasoning iterations
        
        Returns:
            Response with reasoning chain and tool usage
        """
        try:
            if not self._initialized:
                await self.initialize()
            
            print(f"\n🤖 [RAG+Agent] Starting enhanced chat for session: {session_id}")
            print(f"   📋 Message: {message[:60]}...")
            
            # Get context from RAG (documents)
            print(f"📚 [RAG+Agent] Retrieving context from documents...")
            
            learning_profile = self.get_or_create_learning_profile(session_id)
            
            if use_adaptive_learning and message:
                indicators = learning_profile.analyze_message_patterns(message)
                learning_profile.update_from_interaction(indicators)
                learning_style = learning_profile.get_learning_style()
            else:
                learning_style = {}
            
            # Get context from vectorstore
            if use_adaptive_learning and learning_style:
                context_docs = self.vectorstore.adaptive_similarity_search(
                    message, learning_style, k=settings.TOP_K,
                    session_id=session_id, document_ids=document_ids
                )
            else:
                context_docs = self.vectorstore.similarity_search(
                    message, k=settings.TOP_K,
                    session_id=session_id, document_ids=document_ids
                )
            
            # Format context for agent
            rag_context = ""
            if context_docs:
                rag_context = "## Retrieved Document Context\n"
                for i, doc in enumerate(context_docs[:3], 1):
                    rag_context += f"\n### Document {i}\n"
                    rag_context += f"Source: {doc.get('metadata', {}).get('source', 'unknown')}\n"
                    rag_context += f"Content: {doc['content'][:300]}...\n"
            
            print(f"✅ Retrieved {len(context_docs)} documents for context")
            
            # Use agent reasoning
            print(f"🧠 [RAG+Agent] Starting agent reasoning...")
            agent_result = await self.agent.reason_and_act(
                message=message,
                session_id=session_id,
                context=rag_context,
                enable_tools=enable_tools,
                max_iterations=max_iterations
            )
            
            if agent_result.get("status") == "error":
                print(f"❌ Agent error: {agent_result.get('error')}")
                return {
                    "answer": f"Error in processing: {agent_result.get('error')}",
                    "status": "error",
                    "reasoning_chain": agent_result.get("reasoning_chain", [])
                }
            
            # Extract final response
            final_response = agent_result.get("final_response", "")
            reasoning_chain = agent_result.get("reasoning_chain", [])
            iterations = agent_result.get("iterations", 0)
            
            print(f"✅ Agent completed with {iterations} iterations")
            
            # Add to conversation history
            history = self.get_session_history(session_id)
            history.add_user_message(message)
            history.add_ai_message(final_response)
            
            # Save profiles
            if learning_profile.total_interactions % 5 == 0:
                self._save_learning_profiles()
            
            # Build tools summary from reasoning chain
            tools_used = []
            for step in reasoning_chain:
                if step.get("type") == "action":
                    tools_used.append({
                        "tool": step.get("action"),
                        "result_summary": str(step.get("result", {}))[:100]
                    })
            
            return {
                "answer": final_response,
                "status": "success",
                "reasoning_chain": reasoning_chain,
                "iterations": iterations,
                "tools_used": tools_used,
                "document_context_count": len(context_docs),
                "learning_style": learning_style if use_adaptive_learning else None
            }
        
        except Exception as e:
            print(f"❌ Error in agent chat: {e}")
            traceback.print_exc()
            return {
                "answer": f"Error: {str(e)}",
                "status": "error",
                "reasoning_chain": []
            }
    
    async def get_available_tools(self) -> Dict:
        """Get list of all available tools"""
        if not self._initialized:
            await self.initialize()
        
        tools_info = self.agent.tools_manager.get_tool_list()
        return tools_info
    
    def get_agent_memory_summary(self, session_id: str) -> Dict:
        """Get agent's memory summary for a session"""
        if not self.agent:
            return {"error": "Agent not initialized"}
        
        return self.agent.get_memory_summary(session_id)
    
    def clear_agent_memory(self, session_id: str):
        """Clear agent's memory for a session"""
        if self.agent:
            self.agent.clear_memory(session_id)
            print(f"✅ Cleared agent memory for session: {session_id}")