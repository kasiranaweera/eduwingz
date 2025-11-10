from config import settings
from langchain_ollama import ChatOllama
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
import types

class LLM_Model:
    def __init__(self):
        self.client = None
        self.backend = settings.LLM_BACKEND.lower()

    def get_client(self):
        if self.client is None:
            if self.backend == "ollama":
                self.client = ChatOllama(
                    model=settings.OLLAMA_MODEL,
                    base_url=settings.OLLAMA_BASE_URL,
                    temperature=0.7,
                    num_predict=512  # Equivalent to max_tokens
                )
                # ChatOllama.invoke takes list of messages and returns AIMessage with .content
            elif self.backend == "huggingface":
                print(f"Loading HuggingFace model '{settings.LLM_MODEL}' on cpu...")
                device = torch.device("cpu")
                self.tokenizer = AutoTokenizer.from_pretrained(settings.LLM_MODEL)
                model = AutoModelForCausalLM.from_pretrained(settings.LLM_MODEL)
                model = model.to(device)
                self.pipeline = pipeline(
                    "text-generation",
                    model=model,
                    tokenizer=self.tokenizer,
                    device=-1 if device.type == "cpu" else 0,
                )
                # Create a wrapper for invoke that takes list of langchain messages
                def hf_invoke(lc_messages, max_tokens=512):
                    messages = []
                    for msg in lc_messages:
                        if isinstance(msg, SystemMessage):
                            role = "system"
                        elif isinstance(msg, HumanMessage):
                            role = "user"
                        elif isinstance(msg, AIMessage):
                            role = "assistant"
                        else:
                            role = "user"
                        messages.append({"role": role, "content": msg.content})
                    if self.tokenizer.chat_template:
                        prompt = self.tokenizer.apply_chat_template(
                            messages, tokenize=False, add_generation_prompt=True
                        )
                    else:
                        prompt = ""
                        for msg in messages:
                            prompt += f"{msg['role']}: {msg['content']}\n"
                        prompt += "assistant: "
                    outputs = self.pipeline(
                        prompt,
                        max_new_tokens=max_tokens,
                        do_sample=True,
                        temperature=0.7,
                        top_p=0.9,
                        return_full_text=False
                    )
                    return types.SimpleNamespace(content=outputs[0]["generated_text"].strip())
                # Assign the invoke method
                self.client = types.SimpleNamespace(invoke=hf_invoke)
            else:
                raise ValueError(f"Unsupported LLM backend: {self.backend}")
        return self.client