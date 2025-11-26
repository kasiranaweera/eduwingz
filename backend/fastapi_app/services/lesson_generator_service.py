"""
Lesson Generator Service
Generates educational lesson topics using Qwen LLM via FastAPI
"""

import json
from typing import List, Dict, Optional
from langchain_core.messages import SystemMessage, HumanMessage
from llm_model import LLM_Model
from config import settings


class LessonGeneratorService:
    """Service to generate lesson topics using Qwen LLM"""
    
    def __init__(self, llm_client=None):
        """
        Initialize the lesson generator service.
        
        Args:
            llm_client: Optional pre-initialized LLM client. If not provided,
                       creates a new LLM_Model instance (for backwards compatibility).
        """
        if llm_client is not None:
            self.llm_client = llm_client
        else:
            self.llm_model = LLM_Model()
            self.llm_client = self.llm_model.get_client()
    
    def generate_topics(
        self,
        grade: str,
        subject: str,
        topic: str,
        attachments: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Generate lesson topics using Qwen LLM
        
        Args:
            grade: Grade level (e.g., "10", "11", "12")
            subject: Subject name (e.g., "Biology", "Mathematics")
            topic: Topic name (e.g., "Chemical Basis of Life")
            attachments: Optional list of educational materials
            
        Returns:
            Dict with:
            - topics: List of generated topics
            - success: Boolean indicating success
            - message: Status message
        """
        try:
            # Build attachment context
            attachment_context = ""
            if attachments:
                attachment_context = "\n\nAvailable educational materials:\n"
                for attachment in attachments:
                    attachment_context += f"- {attachment.get('name', attachment.get('type'))}\n"
            
            # Create system prompt
            system_prompt = """Create educational content as JSON. Response format:
{"topics": [{"title": "Title", "content": "Content", "order": 1}]}"""

            # Create user prompt
            user_message = f"""Generate 4 topics for Grade {grade} {subject}: {topic}{attachment_context}

Format: JSON only, no markdown. Topics: 1.Intro 2.Concepts 3.Applications 4.Summary"""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ]
            
            print(f"🤖 [LessonGenerator] Generating topics for '{topic}' in {subject} (Grade {grade})...")
            
            # Call LLM
            response = self.llm_client.invoke(messages)
            response_text = response.content.strip() if hasattr(response, 'content') else str(response).strip()
            
            print(f"📝 [LessonGenerator] Response length: {len(response_text)} chars")
            
            # Parse JSON
            topics = self._parse_json_response(response_text)
            
            if not topics:
                return {
                    "success": False,
                    "topics": [],
                    "message": "Failed to generate topics - empty response"
                }
            
            print(f"✅ [LessonGenerator] Successfully generated {len(topics)} topics")
            
            return {
                "success": True,
                "topics": topics,
                "message": f"Generated {len(topics)} topics successfully"
            }
            
        except Exception as e:
            print(f"❌ [LessonGenerator] Error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return {
                "success": False,
                "topics": [],
                "message": f"Error generating topics: {str(e)}"
            }
    
    def _parse_json_response(self, response_text: str) -> List[Dict]:
        """
        Parse JSON from LLM response with multiple fallback strategies
        
        Args:
            response_text: Raw response text from LLM
            
        Returns:
            List of topic dictionaries
        """
        # Strategy 1: Direct JSON parsing
        try:
            data = json.loads(response_text)
            return data.get('topics', [])
        except json.JSONDecodeError:
            pass
        
        # Strategy 2: JSON in ```json ... ``` block
        if "```json" in response_text:
            try:
                start = response_text.find("```json") + 7
                end = response_text.find("```", start)
                if end > start:
                    json_str = response_text[start:end].strip()
                    data = json.loads(json_str)
                    return data.get('topics', [])
            except:
                pass
        
        # Strategy 3: JSON in generic ``` ... ``` block
        if "```" in response_text:
            try:
                start = response_text.find("```") + 3
                end = response_text.find("```", start)
                if end > start:
                    json_str = response_text[start:end].strip()
                    data = json.loads(json_str)
                    return data.get('topics', [])
            except:
                pass
        
        # Strategy 4: Find JSON object in text
        try:
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response_text[start:end]
                data = json.loads(json_str)
                return data.get('topics', [])
        except:
            pass
        
        print(f"⚠️ [LessonGenerator] Could not parse JSON from response:\n{response_text[:500]}")
        return []


    def generate_content_for_topic(self, grade: str, subject: str, topic_title: str, attachments: Optional[List[Dict]] = None, learning_profile=None) -> Dict:
        """Generate adaptive educational note for a single topic using ILS learning profile.

        Args:
            grade: Grade level
            subject: Subject name
            topic_title: Topic title to generate content for
            attachments: Optional educational materials
            learning_profile: Optional ILS learning profile for adaptive prompt generation

        Returns:
            { 'success': bool, 'content': str, 'message': str }
        """
        try:
            # Build attachment context (short)
            attachment_context = ""
            if attachments:
                attachment_context = "\n\nAvailable materials:\n"
                for a in attachments:
                    attachment_context += f"- {a.get('name', a.get('type'))}\n"

            # Use adaptive system prompt if learning profile available
            if learning_profile:
                try:
                    from adaptive_learning import AdaptiveSystemPromptGenerator
                    prompt_generator = AdaptiveSystemPromptGenerator()
                    context = f"Topic: {topic_title} for Grade {grade} {subject}"
                    adaptive_system_prompt = prompt_generator.generate_prompt(learning_profile, context)
                    system_prompt = adaptive_system_prompt
                    print(f"🎯 [LessonGenerator] Using adaptive prompt for learning profile")
                except Exception as e:
                    print(f"⚠️ [LessonGenerator] Could not use adaptive prompt: {e}, falling back to default")
                    system_prompt = self._get_default_system_prompt()
            else:
                system_prompt = self._get_default_system_prompt()

            # Create user prompt
            user_message = (
                f"Grade {grade} {subject} - Topic: {topic_title}. {attachment_context}"
                "\nProduce 1-3 concise paragraphs (clear, student-facing), no JSON, no markdown."
            )

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ]

            print(f"🤖 [LessonGenerator] Generating content for topic: {topic_title}")
            response = self.llm_client.invoke(messages)
            response_text = response.content.strip() if hasattr(response, 'content') else str(response).strip()

            return {
                'success': True,
                'content': response_text,
                'message': 'Content generated'
            }
        except Exception as e:
            print(f"❌ [LessonGenerator] Error generating content for topic '{topic_title}': {e}")
            return {
                'success': False,
                'content': '',
                'message': str(e)
            }

    def _get_default_system_prompt(self) -> str:
        """Get default system prompt for educational notes (when no learning profile)."""
        return (
            "Generate an educational note for a single topic appropriate for the given grade. "
            "Do NOT produce a lesson plan or teacher guide. Adapt the wording for different learning styles when appropriate (visual, auditory, kinesthetic, reading/writing). "
            "Reply with plain text only."
        )
