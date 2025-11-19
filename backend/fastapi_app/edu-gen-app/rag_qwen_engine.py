# rag_qwen_engine.py
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch
from config import settings

class EduBrain:
    def __init__(self):
        model_id = settings.LLM_MODEL
        print(f"Loading LLM: {model_id} ... (first run takes 1-3 min)")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True
        )
        
        self.pipe = pipeline(
            "text-generation",
            model=self.model,
            tokenizer=self.tokenizer,
            max_new_tokens=2048,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )

    def ask(self, prompt: str, max_tokens: int = 1500) -> str:
        messages = [{"role": "user", "content": prompt}]
        outputs = self.pipe(messages, max_new_tokens=max_tokens)
        return outputs[0]["generated_text"][-1]["content"]