import os
import asyncio
from typing import Dict, List
import numpy as np
import faiss
import pickle
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from llm_model import LLM_Model
from config import settings

class FAISSVectorStore:
    def __init__(self, embedding_model):
        self.embedding_model = embedding_model
        self.index = None
        self.documents = []
        self.dimension = 768  # embedding dimension for all-mpnet-base-v2

    def add_documents(self, docs: List[str], metadatas: List[Dict] = None):
        if not docs:
            return
        embeddings = self.embedding_model.embed_documents(docs)
        embeddings_np = np.array(embeddings).astype("float32")
        if self.index is None:
            self.index = faiss.IndexFlatIP(self.dimension)
        faiss.normalize_L2(embeddings_np)
        self.index.add(embeddings_np)
        for i, doc in enumerate(docs):
            self.documents.append(
                {"content": doc, "metadata": metadatas[i] if metadatas else {}}
            )

    def similarity_search(self, query: str, k: int = 5) -> List[Dict]:
        if self.index is None or len(self.documents) == 0:
            return []
        query_embedding = self.embedding_model.embed_query(query)
        query_np = np.array([query_embedding]).astype("float32")
        faiss.normalize_L2(query_np)
        scores, indices = self.index.search(query_np, min(k, len(self.documents)))
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:
                results.append(
                    {
                        **self.documents[idx],
                        "score": float(score),
                    }
                )
        return results

    def save_index(self, path: str):
        if self.index is not None:
            faiss.write_index(self.index, f"{path}.faiss")
            with open(f"{path}.pkl", "wb") as f:
                pickle.dump(self.documents, f)

    def load_index(self, path: str):
        try:
            if os.path.exists(f"{path}.faiss") and os.path.exists(f"{path}.pkl"):
                self.index = faiss.read_index(f"{path}.faiss")
                with open(f"{path}.pkl", "rb") as f:
                    self.documents = pickle.load(f)
                return True
        except Exception as e:
            print(f"Error loading index: {e}")
        return False

class RAGService:
    def __init__(self):
        load_dotenv()
        self.llm = None
        self.embedding_model = None
        self.vectorstore = None
        self.session_histories = {}
        self._initialized = False

    async def initialize(self):
        if self._initialized:
            return
        try:
            self.llm = LLM_Model().get_client()
            self.embedding_model = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
            self.vectorstore = FAISSVectorStore(self.embedding_model)
            self.vectorstore.load_index("data/vectorstore")
            self._initialized = True
            print("✅ RAG Service initialized successfully!")
        except Exception as e:
            print(f"❌ Error initializing RAG service: {e}")
            raise

    async def process_document(self, file_path: str) -> bool:
        try:
            loader = PyPDFLoader(file_path)
            docs = await asyncio.get_event_loop().run_in_executor(None, loader.load)
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=settings.CHUNK_SIZE,
                chunk_overlap=settings.CHUNK_OVERLAP,
            )
            chunks = text_splitter.split_documents(docs)
            texts = [chunk.page_content for chunk in chunks]
            metadatas = [chunk.metadata for chunk in chunks]
            self.vectorstore.add_documents(texts, metadatas)
            os.makedirs("data", exist_ok=True)
            self.vectorstore.save_index("data/vectorstore")
            print(f"✅ Processed document: {file_path}")
            return True
        except Exception as e:
            print(f"❌ Error processing document {file_path}: {e}")
            return False

    def get_session_history(self, session_id: str) -> BaseChatMessageHistory:
        if session_id not in self.session_histories:
            self.session_histories[session_id] = ChatMessageHistory()
        return self.session_histories[session_id]

    def clear_session_history(self, session_id: str):
        if session_id in self.session_histories:
            del self.session_histories[session_id]

    async def chat(self, message: str, session_id: str) -> Dict:
        try:
            if not self._initialized:
                await self.initialize()
            # Retrieve relevant context from FAISS
            context_docs = self.vectorstore.similarity_search(message, k=settings.TOP_K)
            context = "\n\n".join([doc["content"] for doc in context_docs])
            history = self.get_session_history(session_id)
            # Build langchain messages
            system_content = (
                "You are an intelligent chatbot with strong reasoning abilities. "
                "Use the following context to answer the question. Think step by step and provide clear reasoning. "
                "If you don't know the answer based on the context, say that you don't know.\n\n"
                f"Context:\n{context}\n\n"
            )
            lc_messages = [SystemMessage(content=system_content)]
            for msg in history.messages:
                if msg.type == "human":
                    lc_messages.append(HumanMessage(content=msg.content))
                else:
                    lc_messages.append(AIMessage(content=msg.content))
            lc_messages.append(HumanMessage(content=message))
            # Run the LLM
            response = await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.llm.invoke(lc_messages)
            )
            # Save to history
            history.add_user_message(message)
            history.add_ai_message(response.content)
            return {
                "answer": response.content,
                "context": [
                    {
                        "content": doc["content"][:200] + "..." if len(doc["content"]) > 200 else doc["content"],
                        "metadata": doc["metadata"],
                        "score": doc["score"],
                    }
                    for doc in context_docs
                ],
            }
        except Exception as e:
            print(f"❌ Error in chat processing: {e}")
            import traceback
            traceback.print_exc()
            return {"answer": f"I'm sorry, I encountered an error: {str(e)}", "context": []}