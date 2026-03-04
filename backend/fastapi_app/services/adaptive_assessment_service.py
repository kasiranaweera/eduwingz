# adaptive_assessment_service.py
import json
from typing import Dict, List, Optional
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel
import traceback

class AdaptiveAssessmentService:
    """Generates assessments customized based on the ILS Learning Profile"""
    
    def __init__(self, llm_client=None, rag_service=None):
        self.llm_client = llm_client
        self.rag_service = rag_service

    async def generate_adaptive_quiz(
        self,
        topic: str,
        subject: str = "",
        grade: str = "",
        base_difficulty: str = "medium",
        num_questions: int = 5,
        learning_profile=None
    ) -> Dict:
        """
        Generate quiz questions using the LLM, adapted to the user's learning profile.
        """
        try:
            print(f"🧩 [AdaptiveAssessment] Generating adaptive quiz: {topic} ({base_difficulty})")
            
            # Determine adjustments based on learning profile
            adaptation_instructions = ""
            presentation_style_instructions = ""
            
            if learning_profile:
                style = learning_profile.get_learning_style()
                ar = style.get('processing', 'balanced')
                si = style.get('perception', 'balanced')
                vv = style.get('input', 'balanced')
                sg = style.get('understanding', 'balanced')
                
                print(f"   👤 Applying learning profile: AR={ar}, SI={si}, VV={vv}, SG={sg}")
                
                # Active/Reflective accommodations
                if ar == 'active':
                    adaptation_instructions += "- Include questions that describe practical scenarios or ask 'what happens if you do X?'.\n"
                    presentation_style_instructions += "- Keep explanations concise and action-oriented.\n"
                elif ar == 'reflective':
                    adaptation_instructions += "- Include questions that ask 'Why did this happen?' or evaluate theoretical understanding.\n"
                    presentation_style_instructions += "- Provide detailed, thoughtful explanations that encourage deeper analysis.\n"
                
                # Sensing/Intuitive accommodations
                if si == 'sensing':
                    adaptation_instructions += "- Focus on concrete facts, established procedures, and specific details.\n"
                    presentation_style_instructions += "- Explanations should be step-by-step and factual.\n"
                elif si == 'intuitive':
                    adaptation_instructions += "- Focus on abstract concepts, underlying principles, and finding connections.\n"
                    presentation_style_instructions += "- Explanations should highlight the 'big picture' and abstract rules.\n"
                
                # Visual/Verbal accommodations
                if vv == 'visual':
                    presentation_style_instructions += "- Use highly descriptive visual language in explanations (e.g., 'Picture a...', 'Imagine the flow...').\n"
                elif vv == 'verbal':
                    presentation_style_instructions += "- Use clear, precise, and structured language in explanations.\n"
                
                # Sequential/Global accommodations
                if sg == 'sequential':
                    adaptation_instructions += "- Question sequence should follow a logical, step-by-step progression of difficulty or chronology.\n"
                    presentation_style_instructions += "- Explanations should outline clearly numbered '1. 2. 3.' steps if applicable.\n"
                elif sg == 'global':
                    adaptation_instructions += "- Include questions that require integrating multiple concepts from the topic.\n"
                    presentation_style_instructions += "- Explanations should connect the answer back to the overarching topic context.\n"
            
            
            if not adaptation_instructions:
                adaptation_instructions = "- Provide standard, well-rounded educational questions."
            if not presentation_style_instructions:
                presentation_style_instructions = "- Provide clear and educational explanations."

            system_prompt = f"""You are an advanced adaptive educational quiz generator.
Generate exactly {num_questions} {base_difficulty} difficulty multiple-choice questions about "{topic}" for {grade or 'high school students'} studying {subject or 'general education'}.

To accommodate the specific student's learning style, you MUST apply these constraints:
Question Design:
{adaptation_instructions}

Explanation Style:
{presentation_style_instructions}

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{{
  "title": "Quiz title",
  "description": "Brief quiz description",
  "time_limit": 30,
  "questions": [
    {{
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why the correct answer is correct"
    }}
  ]
}}

IMPORTANT:
- "correct" is the zero-based index of the correct option.
- Each question MUST have exactly 4 options.
- The output MUST be raw JSON parseable by json.loads() in Python.
"""
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Generate the adaptive quiz for: {topic}")
            ]

            import asyncio
            response = await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.llm_client.invoke(messages, max_tokens=4096)
            )
            
            response_text = response.content if hasattr(response, 'content') else str(response)

            # Clean up JSON
            text = response_text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            if text.startswith("json"):
                text = text[4:].strip()

            try:
                quiz_data = json.loads(text)
            except json.JSONDecodeError:
                # Fallback regex extraction
                import re
                json_match = re.search(r'\{[\s\S]*\}', text)
                if json_match:
                    quiz_data = json.loads(json_match.group())
                else:
                    raise Exception("Failed to parse quiz JSON")
            
            print(f"✅ [AdaptiveAssessment] Generated quiz with {len(quiz_data.get('questions', []))} questions")
            return quiz_data

        except Exception as e:
            print(f"❌ [AdaptiveAssessment] Error in generation: {e}")
            traceback.print_exc()
            raise e
