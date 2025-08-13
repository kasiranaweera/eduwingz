from langchain_ollama import ChatOllama

class LLM_Model:

    def __init__(self, model="deepseek-r1:7b", base_url="http://localhost:11434", temperature=0.3):
        self.model = model
        self.base_url = base_url
        self.temperature = temperature
        self.llm = ChatOllama(
            model=self.model,
            base_url=self.base_url,
            temperature=self.temperature
        )
    
    def get_client(self):
        """Returns the ChatOllama instance"""
        return self.llm
    
    def update_temperature(self, new_temperature):
        """Update the temperature and recreate the client"""
        self.temperature = new_temperature
        self.llm = ChatOllama(
            model=self.model,
            base_url=self.base_url,
            temperature=self.temperature
        )
    
    def update_model(self, new_model):
        """Update the model and recreate the client"""
        self.model = new_model
        self.llm = ChatOllama(
            model=self.model,
            base_url=self.base_url,
            temperature=self.temperature
        )
    
    def __str__(self):
        return f"ChatOllamaClient(model={self.model}, base_url={self.base_url}, temperature={self.temperature})"