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
from langchain_ollama import ChatOllama




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

llm = ChatOllama(
    model= "deepseek-r1:7b",
    base_url="http://localhost:11434",

    temperature=0.3

)

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
splits = text_splitter.split_documents(docs)


# Create a vector store from the document chunks
vectorstore = Chroma.from_documents(documents=splits, embedding=embedding_model)
     

# Create a retriever from the vector store
retriever = vectorstore.as_retriever()

# Define prompt template
template = """
Answer this question using the provided context only.

{question}

Context:
{context}

Answer:
"""

prompt=ChatPromptTemplate.from_template(template)

chain = (
    {"context": retriever,  "question": RunnablePassthrough()}
    | prompt
    | llm
    | output_parser
)
    
response = chain.invoke("what is EduWingz")
print(response)