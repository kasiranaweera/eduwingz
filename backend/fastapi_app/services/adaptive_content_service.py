# adaptive_content_service.py
import json
from typing import Dict, List, Optional
from langchain_core.messages import SystemMessage, HumanMessage
import asyncio
import traceback

class AdaptiveContentService:
    """Service to adapt generated content into various formats (Text, Mind Map, Audio Script)"""
    
    def __init__(self, llm_client=None, rag_service=None):
        self.llm_client = llm_client
        self.rag_service = rag_service

    async def generate_mind_map(self, topic_title: str, text_content: str) -> str:
        """
        Takes text content and uses the LLM to generate a Mermaid.js mindmap diagram.
        """
        print(f"🧠 [AdaptiveContent] Generating Mermaid Mind Map for: {topic_title}")
        try:
            system_prompt = """You are an expert at creating educational mind maps using Mermaid.js syntax.
Given the text content of a topic, generate a structured, hierarchical `mindmap` diagram.
The root node should be the main topic.
Branch out to key definitions, concepts, and examples.

RULES:
- Start the response exactly with `mindmap`
- Use proper indentation for Mermaid mindmaps.
- Do NOT wrap the diagram in markdown code blocks like ```mermaid.
- ONLY output the Mermaid code, nothing else.
- Keep text labels concise to fit in a diagram.
"""
            user_msg = f"Topic: {topic_title}\n\nContent:\n{text_content}"
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_msg)
            ]

            response = await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.llm_client.invoke(messages, max_tokens=2048)
            )
            
            code = response.content if hasattr(response, 'content') else str(response)
            code = code.strip()
            # Clean up if the LLM output markdown blocks anyway
            if code.startswith("```mermaid"):
                code = code.replace("```mermaid", "", 1).strip()
            if code.startswith("```"):
                code = code.replace("```", "", 1).strip()
            if code.endswith("```"):
                code = code[:-3].strip()

            return code
        except Exception as e:
            print(f"❌ [AdaptiveContent] Error generating mind map: {e}")
            traceback.print_exc()
            raise e

    async def generate_audio_script(self, topic_title: str, text_content: str) -> str:
        """
        Takes text content and rewrites it to be naturally spoken (an engaging audio script).
        """
        print(f"🎙️ [AdaptiveContent] Generating Audio Script for: {topic_title}")
        try:
            system_prompt = """You are an engaging human podcast host / teacher.
Rewrite the provided educational text content into a conversational, easy-to-listen-to audio script.
- Remove complex bulleted or numbered formatting. Transition smoothly between ideas.
- Speak directly to the listener (e.g., 'Imagine you are...', 'Let's talk about...').
- The script should be plain text, suitable for a Text-to-Speech (TTS) engine.
- DO NOT output any pronunciation guides, host cues, placeholders, or markdown formatting. 
- Output ONLY the spoken words.
"""
            user_msg = f"Topic: {topic_title}\n\nContent:\n{text_content}"
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_msg)
            ]

            response = await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.llm_client.invoke(messages, max_tokens=2048)
            )
            
            script = response.content if hasattr(response, 'content') else str(response)
            return script.strip()
        except Exception as e:
            print(f"❌ [AdaptiveContent] Error generating audio script: {e}")
            traceback.print_exc()
            raise e
