from config import settings
from langchain_ollama import ChatOllama
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
import types
import requests
import json

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
                    num_predict=settings.MAX_TOKENS  # Use configurable max tokens
                )
                # ChatOllama.invoke takes list of messages and returns AIMessage with .content
            elif self.backend == "openrouter":
                print(f"🌐 [LLM] Initializing OpenRouter backend with DeepSeek model...")
                self.client = self._create_openrouter_client()
            elif self.backend == "gemini":
                print(f"🔮 [LLM] Initializing Gemini backend...")
                self.client = self._create_gemini_client()
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
                def hf_invoke(lc_messages, max_tokens=None):
                    if max_tokens is None:
                        max_tokens = settings.MAX_TOKENS
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

    def _create_openrouter_client(self):
        """Create an OpenRouter client wrapper for DeepSeek model."""
        api_key = settings.DEEPSEEK_OPEN_ROUTER_KEY
        if not api_key:
            raise ValueError("DEEPSEEK_OPEN_ROUTER_KEY not set in environment variables")
        
        def openrouter_invoke(lc_messages, max_tokens=None):
            """Invoke the OpenRouter API with the given messages."""
            if max_tokens is None:
                max_tokens = settings.MAX_TOKENS
            
            # Convert LangChain messages to OpenRouter format
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
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": settings.FASTAPI_URL,
                "X-Title": "EduWingz Learning Platform",
            }
            
            payload = {
                "model": "deepseek/deepseek-r1",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": max_tokens,
                "top_p": 0.9,
            }
            
            try:
                print(f"📡 [OpenRouter] Sending request to DeepSeek model...")
                response = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=60
                )
                
                if response.status_code != 200:
                    error_msg = f"OpenRouter API error: {response.status_code}"
                    try:
                        error_data = response.json()
                        if "error" in error_data:
                            error_msg += f" - {error_data['error'].get('message', '')}"
                    except:
                        error_msg += f" - {response.text}"
                    raise Exception(error_msg)
                
                result = response.json()
                
                # Extract the content from the response
                if "choices" in result and len(result["choices"]) > 0:
                    content = result["choices"][0]["message"]["content"]
                    print(f"✅ [OpenRouter] Received response from DeepSeek ({len(content)} chars)")
                    return types.SimpleNamespace(content=content.strip())
                else:
                    raise Exception(f"Unexpected OpenRouter response format: {result}")
                    
            except requests.exceptions.Timeout:
                raise Exception("OpenRouter API request timed out after 60 seconds")
            except requests.exceptions.RequestException as e:
                raise Exception(f"OpenRouter API request failed: {str(e)}")
        
        return types.SimpleNamespace(invoke=openrouter_invoke)

    def _create_gemini_client(self):
        """Create a Gemini client wrapper using Google's Generative AI."""
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError("GEMINI_API_KEY not set in environment variables")
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            print(f"✅ [Gemini] API configured successfully")
        except ImportError:
            raise ImportError("google-generativeai not installed. Install with: pip install google-generativeai")
        
        def gemini_invoke(lc_messages, max_tokens=None):
            """Invoke the Gemini API with the given messages."""
            if max_tokens is None:
                max_tokens = settings.MAX_TOKENS
            
            # Convert LangChain messages to Gemini format
            messages = []
            for msg in lc_messages:
                if isinstance(msg, SystemMessage):
                    role = "user"  # Gemini doesn't have system role, treat as user with context
                    content = f"[SYSTEM INSTRUCTION] {msg.content}"
                elif isinstance(msg, HumanMessage):
                    role = "user"
                    content = msg.content
                elif isinstance(msg, AIMessage):
                    role = "model"
                    content = msg.content
                else:
                    role = "user"
                    content = msg.content
                messages.append({"role": role, "parts": [{"text": content}]})
            
            try:
                print(f"📡 [Gemini] Sending request to Gemini model...")
                
                # Use Gemini 1.5 Pro model (latest available)
                model = genai.GenerativeModel(
                    model_name='gemini-2.5-flash',
                    generation_config={
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "max_output_tokens": max_tokens,
                    }
                )
                
                # Build chat history (Gemini needs proper format)
                chat_history = []
                system_prompt = ""
                
                for msg in lc_messages:
                    if isinstance(msg, SystemMessage):
                        system_prompt = msg.content
                    elif isinstance(msg, HumanMessage):
                        chat_history.append({
                            "role": "user",
                            "parts": [{"text": msg.content}]
                        })
                    elif isinstance(msg, AIMessage):
                        chat_history.append({
                            "role": "model",
                            "parts": [{"text": msg.content}]
                        })
                
                # Get the last user message
                user_input = lc_messages[-1].content if lc_messages else "Hello"
                
                # If we have a system prompt, prepend it to the first user message
                if system_prompt:
                    user_input = f"{system_prompt}\n\n{user_input}"
                
                # Start chat with history
                chat = model.start_chat(history=chat_history[:-1] if chat_history and isinstance(lc_messages[-1], HumanMessage) else chat_history)
                
                # Send message and get response
                response = chat.send_message(user_input)
                content = response.text.strip()
                
                print(f"✅ [Gemini] Received response ({len(content)} chars)")
                return types.SimpleNamespace(content=content)
                
            except Exception as e:
                error_msg = f"Gemini API error: {str(e)}"
                if "API key" in str(e) or "403" in str(e) or "401" in str(e):
                    raise Exception(f"{error_msg} - Check your GEMINI_API_KEY")
                elif "quota" in str(e).lower() or "429" in str(e):
                    raise Exception(f"{error_msg} - You've exceeded your quota or rate limit")
                elif "not found" in str(e).lower() or "404" in str(e):
                    raise Exception(f"{error_msg} - Model not available. Try 'gemini-1.5-flash' or check available models")
                else:
                    raise Exception(error_msg)
        
        return types.SimpleNamespace(invoke=gemini_invoke)