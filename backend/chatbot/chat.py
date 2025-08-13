from dotenv import load_dotenv
import os

load_dotenv()
hf_token = os.getenv("HUGGINGFACE_TOKEN")

from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from langchain_community.llms import HuggingFacePipeline
import torch
from langchain.schema.output_parser import StrOutputParser
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from llm_model import LLM_Model
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_history_aware_retriever
from langchain_core.prompts import MessagesPlaceholder
from langchain.chains import create_history_aware_retriever
from langchain_core.prompts import MessagesPlaceholder

from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever




# # Define the model ID
# model_id = "mistralai/Mistral-7B-v0.1"

# # Load the tokenizer and model
# tokenizer = AutoTokenizer.from_pretrained(model_id, token=hf_token)
# model = AutoModelForCausalLM.from_pretrained(model_id, device_map="auto", torch_dtype=torch.bfloat16, token=huggingface_api_token)

# # Create a text generation pipeline
# pipe = pipeline(
#     "text-generation",
#     model=model,
#     tokenizer=tokenizer,
#     max_new_tokens=256,
#     do_sample=True,
#     temperature=0.1, # Use temperature here as before
#     trust_remote_code=True,
#     device_map="auto",
# )

# # Initialize the HuggingFace llm using the pipeline
# llm = HuggingFacePipeline(pipeline=pipe)

llm = LLM_Model().get_client()

# Initialize Embedding Model
embedding_model = HuggingFaceEmbeddings(
  model_name="sentence-transformers/all-mpnet-base-v2"
)

# Initialize Output Parser
output_parser=StrOutputParser()

# Load the PDF document
loader = PyPDFLoader("Project Proposal - EduWingz .pdf")

docs = loader.load()

# Initialize the text splitter
text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)

# Split the documents into chunks
chunks = text_splitter.split_documents(docs)


# Create a vector store from the document chunks
vectorstore = Chroma.from_documents(documents=chunks, embedding=embedding_model)
     

# Create a retriever from the vector store
vectorstore_retreiver = vectorstore.as_retriever(search_kwargs={"k": 5})

keyword_retriever = BM25Retriever.from_documents(chunks)

keyword_retriever.k =  5

ensemble_retriever = EnsembleRetriever(retrievers = [vectorstore_retreiver, keyword_retriever], weights = [0.5, 0.5])



# Define prompt template
contextualize_system_prompt = (
    "using chat history and the latest user question, just reformulate question if needed and otherwise return it as is"
)

contextualize_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)

history_aware_retriever = create_history_aware_retriever(
    llm, ensemble_retriever, contextualize_prompt
)

system_prompt = (
    "You are an intelligent chatbot. Use the following context to answer the question. If you don't know the answer, just say that you don't know."
    "\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)

qa_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(history_aware_retriever, qa_chain)

# Initialize the store for session histories
store = {}

# Function to get the session history for a given session ID
def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

# Create the conversational RAG chain with session history
conversational_rag_chain = RunnableWithMessageHistory(
    rag_chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
    output_messages_key="answer",
)

response = conversational_rag_chain.invoke(
    {"input": "what is EduWingz?"},
    config={"configurable": {"session_id": "101"}},
)

print(response["answer"])