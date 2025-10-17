from langchain_community.llms import Ollama
from config import settings

class LLM_Model:
    def __init__(self):
        self.client = None

    def get_client(self):
        if self.client is None:
            self.client = Ollama(
                base_url=settings.OLLAMA_BASE_URL,
                model=settings.OLLAMA_MODEL
            )
        return self.client