# from langchain_ollama import OllamaLLM
# from config import settings

# class LLM_Model:
#     def __init__(self):
#         self.client = None

#     def get_client(self):
#         if self.client is None:
#             self.client = OllamaLLM(
#                 base_url=settings.OLLAMA_BASE_URL,
#                 model=settings.OLLAMA_MODEL,
#                 num_gpu=0,
#                 num_thread=4 
#             )
#         return self.client

from transformers import pipeline

class LLM_Model:
    def __init__(self):
        self.pipeline = None
        self.model_name = "google/flan-t5-small"  # CPU-friendly small model

    def get_client(self):
        if self.pipeline is None:
            print(f"Loading HuggingFace model '{self.model_name}' on cpu...")
            self.pipeline = pipeline(
                "text2text-generation",
                model=self.model_name,
                device=-1  # CPU
            )

            # Add .invoke method for RAGService compatibility
            self.pipeline.invoke = lambda prompt, max_tokens=256: type(
                "obj",
                (object,),
                {"content": self.pipeline(prompt, max_new_tokens=max_tokens)[0]["generated_text"]},
            )
        return self.pipeline