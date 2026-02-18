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
    
    def __init__(self, llm_client=None, rag_service=None):
        """
        Initialize the lesson generator service.
        
        Args:
            llm_client: Optional pre-initialized LLM client. If not provided,
                       creates a new LLM_Model instance (for backwards compatibility).
            rag_service: Optional RAG service for retrieving content from PDFs
        """
        if llm_client is not None:
            self.llm_client = llm_client
        else:
            self.llm_model = LLM_Model()
            self.llm_client = self.llm_model.get_client()
        
        self.rag_service = rag_service
    
    def generate_topics(
        self,
        grade: str,
        subject: str,
        topic: str,
        attachments: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Generate lesson topics using Qwen LLM based on PDF content
        
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
            # Extract content from PDF if RAG service is available
            pdf_content = ""
            if self.rag_service:
                pdf_content = self._extract_pdf_content(grade, subject, topic)
                if pdf_content:
                    print(f"📚 [LessonGenerator] Extracted {len(pdf_content)} chars from PDF")
            
            # Build attachment context
            attachment_context = ""
            if attachments:
                attachment_context = "\n\nAvailable educational materials:\n"
                for attachment in attachments:
                    attachment_context += f"- {attachment.get('name', attachment.get('type'))}\n"
            
            # Create system prompt with explicit instruction to use PDF content
            system_prompt = """Create educational content as JSON based on the provided textbook material. 
Response format: {"topics": [{"title": "Title", "content": "Content summary", "order": 1}]}
Requirements:
- Extract topics DIRECTLY from the provided textbook content
- Ensure each topic is based on actual material from the textbook
- Do NOT invent topics not in the material
- Return ONLY valid JSON, no markdown or code blocks"""

            # Create user prompt with PDF content
            pdf_instruction = ""
            if pdf_content:
                pdf_instruction = f"\n\nBased on the following textbook material:\n\n{pdf_content}\n\n"
            
            user_message = f"""Generate 4 focused topics for Grade {grade} {subject} - Topic: '{topic}'{attachment_context}{pdf_instruction}Create exactly 4 topics:
1. Introduction/Overview
2. Key Concepts and Definitions  
3. Detailed Explanations and Examples
4. Summary and Applications

Each topic title and content must be extracted from or directly based on the provided textbook material.
Return ONLY JSON, no markdown or additional text."""

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
    
    def _extract_pdf_content(self, grade: str, subject: str, topic: str) -> str:
        """
        Extract relevant content from PDF textbooks using RAG service
        
        Args:
            grade: Grade level (e.g., "10", "11", "12")
            subject: Subject name (e.g., "Science", "Mathematics")
            topic: Topic to search for in PDF
            
        Returns:
            Extracted PDF content relevant to the topic
        """
        try:
            if not self.rag_service or not self.rag_service.vectorstore:
                print(f"⚠️ [LessonGenerator] RAG service not available, generating without PDF content")
                return ""
            
            # Search for content related to the topic in the vectorstore
            search_query = f"{topic} {subject} grade {grade}"
            results = self.rag_service.vectorstore.similarity_search(search_query, k=10)
            
            if not results:
                print(f"⚠️ [LessonGenerator] No PDF content found for '{topic}'")
                return ""
            
            # Combine search results
            pdf_content = "\n".join([doc.page_content for doc in results])
            
            # Limit to reasonable size to avoid token overflow
            max_chars = 3000
            if len(pdf_content) > max_chars:
                pdf_content = pdf_content[:max_chars] + "..."
            
            return pdf_content
            
        except Exception as e:
            print(f"⚠️ [LessonGenerator] Error extracting PDF content: {str(e)}")
            return ""
    
    def _parse_json_response(self, response_text: str) -> List[Dict]:
        """
        Parse JSON from LLM response with multiple fallback strategies
        
        Args:
            response_text: Raw response text from LLM
            
        Returns:
            List of topic dictionaries
        """
        # First, strip any <think>...</think> tags from the response
        cleaned_text = self._strip_think_tags(response_text)
        
        # Strategy 1: Direct JSON parsing
        try:
            data = json.loads(cleaned_text)
            return data.get('topics', [])
        except json.JSONDecodeError:
            pass
        
        # Strategy 2: JSON in ```json ... ``` block
        if "```json" in cleaned_text:
            try:
                start = cleaned_text.find("```json") + 7
                end = cleaned_text.find("```", start)
                if end > start:
                    json_str = cleaned_text[start:end].strip()
                    data = json.loads(json_str)
                    return data.get('topics', [])
            except:
                pass
        
        # Strategy 3: JSON in generic ``` ... ``` block
        if "```" in cleaned_text:
            try:
                start = cleaned_text.find("```") + 3
                end = cleaned_text.find("```", start)
                if end > start:
                    json_str = cleaned_text[start:end].strip()
                    data = json.loads(json_str)
                    return data.get('topics', [])
            except:
                pass
        
        # Strategy 4: Find JSON object in text
        try:
            start = cleaned_text.find('{')
            end = cleaned_text.rfind('}') + 1
            if start != -1 and end > start:
                json_str = cleaned_text[start:end]
                data = json.loads(json_str)
                return data.get('topics', [])
        except:
            pass
        
        print(f"⚠️ [LessonGenerator] Could not parse JSON from response:\n{cleaned_text[:500]}")
        return []


    def generate_content_for_topic(self, grade: str, subject: str, topic_title: str, attachments: Optional[List[Dict]] = None, learning_profile=None) -> Dict:
        """Generate adaptive educational note for a single topic using ILS learning profile.
        Implements iterative generation for comprehensive notes covering all aspects.

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

            # First iteration: Generate initial comprehensive content
            user_message = (
                f"Grade {grade} {subject} - Topic: {topic_title}. {attachment_context}"
                "\nGenerate a COMPREHENSIVE educational note covering ALL key aspects of this topic. "
                "\nProduce 2-4 detailed paragraphs (clear, student-facing), no JSON, no markdown. "
                "\nCover: definitions, key concepts, examples, and practical applications."
            )

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ]

            print(f"🤖 [LessonGenerator] Generating comprehensive content for topic: {topic_title}")
            response = self.llm_client.invoke(messages)
            response_text = response.content.strip() if hasattr(response, 'content') else str(response).strip()
            
            # Strip think tags from response
            content = self._strip_think_tags(response_text)
            
            # Check if content seems incomplete (ends with common truncation patterns)
            # If incomplete, continue generation
            if self._is_incomplete(content):
                print(f"📝 [LessonGenerator] Content appears incomplete, generating continuation...")
                continuation_message = (
                    f"Continue and complete the comprehensive note for '{topic_title}'. "
                    f"Build on what was covered, add more examples, details, or practical applications. "
                    f"Make the note complete and self-contained. No markdown or JSON."
                )
                
                messages.append(HumanMessage(content=continuation_message))
                continuation_response = self.llm_client.invoke(messages)
                continuation_text = continuation_response.content.strip() if hasattr(continuation_response, 'content') else str(continuation_response).strip()
                
                # Strip think tags from continuation
                continuation_text = self._strip_think_tags(continuation_text)
                
                # Combine with initial content
                content = content + "\n\n" + continuation_text
                print(f"✅ [LessonGenerator] Content completed with continuation")

            return {
                'success': True,
                'content': content,
                'message': 'Content generated successfully'
            }
        except Exception as e:
            print(f"❌ [LessonGenerator] Error generating content for topic '{topic_title}': {e}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'content': '',
                'message': str(e)
            }

    def _is_incomplete(self, text: str) -> bool:
        """Check if generated content appears incomplete or truncated.
        
        Args:
            text: The generated content
            
        Returns:
            True if content appears incomplete, False otherwise
        """
        if not text or len(text.strip()) < 100:
            return True
        
        # Check for truncation patterns
        truncation_indicators = [
            text.rstrip().endswith(','),  # Ends with comma
            text.rstrip().endswith('-'),  # Ends with dash
            text.rstrip().endswith('and'),  # Ends with 'and'
            text.rstrip().endswith('is'),  # Ends with incomplete verb
            'etc.' in text[-50:] and not text.rstrip().endswith('.'),  # etc without period
            text.count('\n') < 2 and len(text) > 500,  # Long text without paragraph breaks
        ]
        
        is_truncated = any(truncation_indicators)
        if is_truncated:
            print(f"   ⚠️ Content may be incomplete: {truncation_indicators}")
        return is_truncated

    def _get_default_system_prompt(self) -> str:
        """Get default system prompt for educational notes (when no learning profile)."""
        return (
            "Generate an educational note for a single topic appropriate for the given grade. "
            "Do NOT produce a lesson plan or teacher guide. Adapt the wording for different learning styles when appropriate (visual, auditory, kinesthetic, reading/writing). "
            "Reply with plain text only."
        )

    def _strip_think_tags(self, text: str) -> str:
        """Remove <think>...</think> tags from content (e.g., from Claude thinking).
        
        Args:
            text: Text that may contain <think> tags
            
        Returns:
            Text with <think> tags and their contents removed
        """
        import re
        # Remove <think>...</think> tags (case-insensitive, including nested content)
        cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL | re.IGNORECASE)
        # Remove any leftover opening/closing think tags
        cleaned = re.sub(r'</?think>', '', cleaned, flags=re.IGNORECASE)
        return cleaned.strip()
