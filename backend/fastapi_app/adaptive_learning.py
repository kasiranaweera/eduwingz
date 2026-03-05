# adaptive_learning.py

import json
from typing import Dict, List, Optional
from datetime import datetime
import os
import numpy as np
import faiss
import pickle
from langchain_community.embeddings import HuggingFaceEmbeddings
from config import settings


class ILSLearningProfile:
    """Tracks and analyzes user learning patterns based on ILS method"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.dimensions = {
            'active_reflective': 0.5,  # 0.0 to 1.0 (0=active, 1=reflective, 0.5=balanced)
            'sensing_intuitive': 0.5,  # 0.0 to 1.0 (0=sensing, 1=intuitive, 0.5=balanced)
            'visual_verbal': 0.5,      # 0.0 to 1.0 (0=visual, 1=verbal, 0.5=balanced)
            'sequential_global': 0.5   # 0.0 to 1.0 (0=sequential, 1=global, 0.5=balanced)
        }
        self.interaction_history = []
        self.total_interactions = 0
        # Questionnaire data (ILS questionnaire responses)
        self.questionnaire_data = None  # Will store questionnaire responses
        self.questionnaire_completed = False
        self.questionnaire_timestamp = None
    
    def set_questionnaire_data(self, questionnaire_responses: Dict):
        """
        Set ILS questionnaire responses and calculate dimensions
        """
        print(f"📝 [ILS Profile] Setting questionnaire data for user {self.user_id}")
        self.questionnaire_data = questionnaire_responses
        self.questionnaire_completed = True
        self.questionnaire_timestamp = datetime.now().isoformat()
        
        # Set dimensions from questionnaire
        if 'active_reflective' in questionnaire_responses:
            self.dimensions['active_reflective'] = questionnaire_responses['active_reflective']
        if 'sensing_intuitive' in questionnaire_responses:
            self.dimensions['sensing_intuitive'] = questionnaire_responses['sensing_intuitive']
        if 'visual_verbal' in questionnaire_responses:
            self.dimensions['visual_verbal'] = questionnaire_responses['visual_verbal']
        if 'sequential_global' in questionnaire_responses:
            self.dimensions['sequential_global'] = questionnaire_responses['sequential_global']
        
        print(f"✅ [ILS Profile] Questionnaire data set successfully")

    def set_dimensions_from_django(self, django_styles: Dict):
        """
        Set dimensions from Django's -11 to 11 scale
        -11 -> 0.0, 0 -> 0.5, 11 -> 1.0
        """
        print(f"🔄 [ILS Profile] Setting dimensions from Django styles for user {self.user_id}")
        
        from_11 = lambda x: (float(x) + 11.0) / 22.0
        
        if 'active_reflective' in django_styles:
            self.dimensions['active_reflective'] = from_11(django_styles['active_reflective'])
        if 'sensing_intuitive' in django_styles:
            self.dimensions['sensing_intuitive'] = from_11(django_styles['sensing_intuitive'])
        if 'visual_verbal' in django_styles:
            self.dimensions['visual_verbal'] = from_11(django_styles['visual_verbal'])
        if 'sequential_global' in django_styles:
            self.dimensions['sequential_global'] = from_11(django_styles['sequential_global'])
            
        self.questionnaire_completed = True
        print(f"✅ [ILS Profile] Dimensions updated from Django: {self.dimensions}")
    
    def analyze_message_patterns(self, message: str, response_time: float = None):
        """Automatically detect learning patterns from user message"""
        print(f"🔍 [ILS Profile] Analyzing message patterns for user {self.user_id}")
        indicators = {}
        message_lower = message.lower()
        
        # Active vs Reflective detection
        quick_action_words = ['do', 'make', 'create', 'build', 'try', 'test', 'run', 'execute']
        reflective_words = ['why', 'explain', 'understand', 'think', 'analyze', 'theory']
        
        if any(word in message_lower for word in quick_action_words):
            indicators['active_learning'] = True
        if any(word in message_lower for word in reflective_words):
            indicators['reflective_learning'] = True
        
        # Sensing vs Intuitive detection
        practical_words = ['example', 'how to', 'step', 'practical', 'real', 'specific', 'concrete']
        conceptual_words = ['concept', 'theory', 'abstract', 'principle', 'why', 'underlying']
        
        if any(word in message_lower for word in practical_words):
            indicators['sensing_preference'] = True
        if any(word in message_lower for word in conceptual_words):
            indicators['intuitive_preference'] = True
        
        # Visual vs Verbal detection
        visual_words = ['show', 'diagram', 'picture', 'graph', 'chart', 'visualize', 'draw']
        verbal_words = ['explain', 'describe', 'tell', 'write', 'detail']
        
        if any(word in message_lower for word in visual_words):
            indicators['visual_preference'] = True
        if any(word in message_lower for word in verbal_words):
            indicators['verbal_preference'] = True
        
        # Sequential vs Global detection
        sequential_words = ['step by step', 'first', 'next', 'then', 'sequential', 'order']
        global_words = ['overview', 'big picture', 'overall', 'summary', 'relationship']
        
        if any(word in message_lower for word in sequential_words):
            indicators['sequential_preference'] = True
        if any(word in message_lower for word in global_words):
            indicators['global_preference'] = True
        
        # Short messages might indicate active learning
        if len(message.split()) < 10:
            indicators['brief_communication'] = True
        
        if indicators:
            print(f"   📊 Detected indicators: {list(indicators.keys())}")
        else:
            print(f"   ℹ️ No clear learning style indicators detected")
        
        return indicators
    
    def update_from_interaction(self, indicators: Dict):
        """Update learning profile based on detected indicators"""
        print(f"🔄 [ILS Profile] Updating profile from interaction (total: {self.total_interactions + 1})")
        
        # If questionnaire data exists, use weighted combination (70% questionnaire, 30% interactions)
        # Otherwise, use pure interaction-based learning
        questionnaire_weight = 0.7 if self.questionnaire_completed else 0.0
        interaction_weight = 1.0 - questionnaire_weight
        
        old_dimensions = self.dimensions.copy()
        
        # Active vs Reflective
        if indicators.get('active_learning'):
            adjustment = -0.05 * interaction_weight
            self.dimensions['active_reflective'] = max(0.0, self.dimensions['active_reflective'] + adjustment)
        if indicators.get('reflective_learning'):
            adjustment = 0.05 * interaction_weight
            self.dimensions['active_reflective'] = min(1.0, self.dimensions['active_reflective'] + adjustment)
        if indicators.get('brief_communication'):
            adjustment = -0.02 * interaction_weight
            self.dimensions['active_reflective'] = max(0.0, self.dimensions['active_reflective'] + adjustment)
        
        # Sensing vs Intuitive
        if indicators.get('sensing_preference'):
            adjustment = -0.05 * interaction_weight
            self.dimensions['sensing_intuitive'] = max(0.0, self.dimensions['sensing_intuitive'] + adjustment)
        if indicators.get('intuitive_preference'):
            adjustment = 0.05 * interaction_weight
            self.dimensions['sensing_intuitive'] = min(1.0, self.dimensions['sensing_intuitive'] + adjustment)
        
        # Visual vs Verbal
        if indicators.get('visual_preference'):
            adjustment = -0.05 * interaction_weight
            self.dimensions['visual_verbal'] = max(0.0, self.dimensions['visual_verbal'] + adjustment)
        if indicators.get('verbal_preference'):
            adjustment = 0.05 * interaction_weight
            self.dimensions['visual_verbal'] = min(1.0, self.dimensions['visual_verbal'] + adjustment)
        
        # Sequential vs Global
        if indicators.get('sequential_preference'):
            adjustment = -0.05 * interaction_weight
            self.dimensions['sequential_global'] = max(0.0, self.dimensions['sequential_global'] + adjustment)
        if indicators.get('global_preference'):
            adjustment = 0.05 * interaction_weight
            self.dimensions['sequential_global'] = min(1.0, self.dimensions['sequential_global'] + adjustment)
        
        self.total_interactions += 1
        self.interaction_history.append({
            'timestamp': datetime.now().isoformat(),
            'indicators': indicators,
            'dimensions': self.dimensions.copy()
        })
        
        # Print dimension changes
        changes = []
        for key in self.dimensions:
            if old_dimensions[key] != self.dimensions[key]:
                changes.append(f"{key}: {old_dimensions[key]:.1f} → {self.dimensions[key]:.1f}")
        if changes:
            print(f"   📈 Dimension updates: {', '.join(changes)}")
        else:
            print(f"   ℹ️ No dimension changes (questionnaire-weighted)")
    
    def get_learning_style(self) -> Dict[str, str]:
        """Get current learning style classification"""
        print(f"🎯 [ILS Profile] Getting learning style classification")
        style = {}
        
        # Classify each dimension (moderate at ±0.05, strong at ±0.25 from 0.5 midpoint)
        threshold = 0.05
        strong_threshold = 0.25
        
        ar = self.dimensions['active_reflective']
        if abs(ar - 0.5) >= threshold:
            style['processing'] = 'active' if ar < 0.5 else 'reflective'
            style['processing_strength'] = 'strong' if abs(ar - 0.5) >= strong_threshold else 'moderate'
        else:
            style['processing'] = 'balanced'
            style['processing_strength'] = 'balanced'
        print(f"   📊 Processing: {style['processing']} ({style['processing_strength']}) [value: {ar:.2f}]")
        
        si = self.dimensions['sensing_intuitive']
        if abs(si - 0.5) >= threshold:
            style['perception'] = 'sensing' if si < 0.5 else 'intuitive'
            style['perception_strength'] = 'strong' if abs(si - 0.5) >= strong_threshold else 'moderate'
        else:
            style['perception'] = 'balanced'
            style['perception_strength'] = 'balanced'
        print(f"   📊 Perception: {style['perception']} ({style['perception_strength']}) [value: {si:.2f}]")
        
        vv = self.dimensions['visual_verbal']
        if abs(vv - 0.5) >= threshold:
            style['input'] = 'visual' if vv < 0.5 else 'verbal'
            style['input_strength'] = 'strong' if abs(vv - 0.5) >= strong_threshold else 'moderate'
        else:
            style['input'] = 'balanced'
            style['input_strength'] = 'balanced'
        print(f"   📊 Input: {style['input']} ({style['input_strength']}) [value: {vv:.2f}]")
        
        sg = self.dimensions['sequential_global']
        if abs(sg - 0.5) >= threshold:
            style['understanding'] = 'sequential' if sg < 0.5 else 'global'
            style['understanding_strength'] = 'strong' if abs(sg - 0.5) >= strong_threshold else 'moderate'
        else:
            style['understanding'] = 'balanced'
            style['understanding_strength'] = 'balanced'
        print(f"   📊 Understanding: {style['understanding']} ({style['understanding_strength']}) [value: {sg:.2f}]")
        
        if self.questionnaire_completed:
            print(f"   📝 Learning style based on: Questionnaire/Profile Sync")
        else:
            print(f"   📝 Learning style based on: Interactions only")
        
        return style
    
    def to_dict(self) -> Dict:
        """Serialize profile to dictionary"""
        return {
            'user_id': self.user_id,
            'dimensions': self.dimensions,
            'total_interactions': self.total_interactions,
            'interaction_history': self.interaction_history[-10:],  # Keep last 10
            'questionnaire_data': self.questionnaire_data,
            'questionnaire_completed': self.questionnaire_completed,
            'questionnaire_timestamp': self.questionnaire_timestamp
        }
    
    @classmethod
    def from_dict(cls, data: Dict):
        """Deserialize profile from dictionary"""
        profile = cls(data['user_id'])
        profile.dimensions = data.get('dimensions', profile.dimensions)
        profile.total_interactions = data.get('total_interactions', 0)
        profile.interaction_history = data.get('interaction_history', [])
        profile.questionnaire_data = data.get('questionnaire_data')
        profile.questionnaire_completed = data.get('questionnaire_completed', False)
        profile.questionnaire_timestamp = data.get('questionnaire_timestamp')
        return profile


class AdaptiveSystemPromptGenerator:
    """Generates custom system prompts based on ILS learning profiles"""
    
    @staticmethod
    def generate_prompt(learning_profile: ILSLearningProfile, context: str) -> str:
        """Generate customized system prompt based on learning style"""
        print(f"📝 [Prompt Generator] Generating adaptive prompt for user {learning_profile.user_id}")
        style = learning_profile.get_learning_style()
        
        # Check if context has priority markers (PRIMARY CONTEXT)
        has_priority_context = "PRIMARY CONTEXT" in context
        
        base_prompt = "You are an intelligent adaptive learning assistant. Your goal is to explain concepts in a way that perfectly matches the user's learning style.\n\n"
        
        # Add priority instruction if context has priority markers
        if has_priority_context:
            base_prompt += "CRITICAL: Base your answer primarily on the 'PRIMARY CONTEXT' section (from the user's uploaded documents). Use 'ADDITIONAL CONTEXT' only if the primary context is insufficient.\n\n"
        
        # Add adaptive instructions based on learning style
        adaptations = []
        
        # Processing style (Active/Reflective)
        if style['processing'] == 'active':
            adaptations.append(
                "### ACTIVE LEARNER ADAPTATION:\n"
                "- The user learns by doing. Be concise and action-oriented.\n"
                "- Provide practical exercises, immediate 'try this' steps, and real-world application.\n"
                "- Avoid long theoretical introductions; get straight to the 'how-to'."
            )
        elif style['processing'] == 'reflective':
            adaptations.append(
                "### REFLECTIVE LEARNER ADAPTATION:\n"
                "- The user prefers to think things through. Be thorough and analytical.\n"
                "- Provide comprehensive explanations, underlying principles, and time for reflection.\n"
                "- Include thought-provoking 'Why' questions and encourage deep understanding."
            )
        
        # Perception style (Sensing/Intuitive)
        if style['perception'] == 'sensing':
            adaptations.append(
                "### SENSING LEARNER ADAPTATION:\n"
                "- Focus on concrete facts, data, and well-established procedures.\n"
                "- Use clear, specific examples and practical, real-world scenarios.\n"
                "- Be methodical and stick to proven methods."
            )
        elif style['perception'] == 'intuitive':
            adaptations.append(
                "### INTUITIVE LEARNER ADAPTATION:\n"
                "- Focus on abstract concepts, theories, and creative possibilities.\n"
                "- Discuss big-picture implications and underlying mathematical or physical principles.\n"
                "- Highlight connections between different ideas and encourage innovation."
            )
        
        # Input style (Visual/Verbal)
        if style['input'] == 'visual':
            adaptations.append(
                "### VISUAL LEARNER ADAPTATION:\n"
                "- Use highly descriptive language to paint a mental picture.\n"
                "- Describe flows, spatial relationships, and visual patterns.\n"
                "- Suggest or describe diagrams, charts, and visual metaphors (e.g., 'Imagine a pipe flow...')."
            )
        elif style['input'] == 'verbal':
            adaptations.append(
                "### VERBAL LEARNER ADAPTATION:\n"
                "- Emphasize precise written explanations and clear terminology.\n"
                "- Provide well-structured text with clear headings and bullet points.\n"
                "- Use spoken-word metaphors and detailed descriptions."
            )
        
        # Understanding style (Sequential/Global)
        if style['understanding'] == 'sequential':
            adaptations.append(
                "### SEQUENTIAL LEARNER ADAPTATION:\n"
                "- Explain everything in a strict, logical, step-by-step sequence.\n"
                "- Number your points (1, 2, 3...) and show a clear progression of difficulty.\n"
                "- Ensure the cause-and-effect relationship between steps is explicit."
            )
        elif style['understanding'] == 'global':
            adaptations.append(
                "### GLOBAL LEARNER ADAPTATION:\n"
                "- Start with the 'Big Picture' overview before diving into any details.\n"
                "- Explicitly show how this specific detail fits into the larger system.\n"
                "- Use a non-linear approach if it helps show relationships between concepts."
            )
        
        if not adaptations:
            base_prompt += "Provide a balanced, clear, and comprehensive explanation suitable for any learner.\n"
        else:
            base_prompt += "ADAPT YOUR RESPONSE USING THESE LEARNING STYLE RULES:\n" + "\n\n".join(adaptations) + "\n"
        
        # Add context instructions
        base_prompt += (
            "\n### INSTRUCTIONS:\n"
            "1. Use the provided context to answer questions with 100% accuracy.\n"
            "2. Think step-by-step and show your reasoning clearly.\n"
            "3. If the context doesn't contain the answer, admit it honestly.\n"
            "4. NEVER break character: stay as an adaptive educational assistant.\n"
            f"\n### CONTEXT:\n{context}"
        )
        
        return base_prompt


class AdaptiveFAISSVectorStore:
    """Enhanced FAISS store that scores content based on learning style"""
    
    def __init__(self, embedding_model: HuggingFaceEmbeddings):
        self.embedding_model = embedding_model
        self.index = None
        self.documents = []
        self.dimension = 768

    def add_documents(self, docs: List[str], metadatas: List[Dict] = None):
        if not docs:
            return
        embeddings = self.embedding_model.embed_documents(docs)
        embeddings_np = np.array(embeddings).astype("float32")
        if self.index is None:
            self.index = faiss.IndexFlatIP(self.dimension)
        faiss.normalize_L2(embeddings_np)
        self.index.add(embeddings_np)
        for i, doc in enumerate(docs):
            metadata = metadatas[i] if metadatas else {}
            # Analyze content characteristics for learning style matching
            metadata['content_type'] = self._analyze_content_type(doc)
            self.documents.append({"content": doc, "metadata": metadata})

    def _analyze_content_type(self, text: str) -> Dict:
        """Analyze content to determine its learning style characteristics"""
        text_lower = text.lower()
        characteristics = {
            'has_examples': any(word in text_lower for word in ['example', 'for instance', 'such as']),
            'has_theory': any(word in text_lower for word in ['theory', 'principle', 'concept', 'framework']),
            'has_steps': any(word in text_lower for word in ['step 1', 'first', 'second', 'then', 'finally']),
            'has_overview': any(word in text_lower for word in ['overview', 'summary', 'introduction', 'overall']),
            'is_detailed': len(text.split()) > 200,
            'is_concise': len(text.split()) < 100
        }
        return characteristics

    def adaptive_similarity_search(
        self, 
        query: str, 
        learning_style: Dict,
        k: int = 5,
        session_id: str = None,
        document_ids: List[str] = None
    ) -> List[Dict]:
        """Search with learning style-based re-ranking and optional filtering"""
        if self.index is None or len(self.documents) == 0:
            return []
        
        # Get initial results (fetch more than k for re-ranking and filtering)
        query_embedding = self.embedding_model.embed_query(query)
        query_np = np.array([query_embedding]).astype("float32")
        faiss.normalize_L2(query_np)
        
        # When filtering by session_id or document_ids, we need to search through
        # a much larger set to find matching documents, since they might not be
        # in the top similarity results
        if session_id or (document_ids and len(document_ids) > 0):
            # Search through a large portion of documents when filtering
            search_k = min(len(self.documents), max(k * 20, 200))  # Search more when filtering
            print(f"   🔎 Filtering active - searching through {search_k} documents")
        else:
            search_k = min(k * 5, len(self.documents))  # Normal search
        scores, indices = self.index.search(query_np, search_k)
        
        results = []
        total_checked = 0
        filtered_by_session = 0
        filtered_by_doc_id = 0
        sample_metadata_shown = False
        
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:
                total_checked += 1
                doc = self.documents[idx]
                metadata = doc.get("metadata", {})
                doc_id = metadata.get("document_id")
                doc_session_id = metadata.get("session_id")
                
                # Debug: Show sample metadata for first few documents
                if not sample_metadata_shown and total_checked <= 3:
                    print(f"   📋 Sample doc {total_checked} metadata: session_id={doc_session_id}, document_id={doc_id}")
                    if total_checked == 3:
                        sample_metadata_shown = True
                
                # STRICT filtering: If session_id or document_ids are provided, 
                # only include documents with proper metadata
                if session_id:
                    # If session_id is provided, document MUST have matching session_id
                    if not doc_session_id or doc_session_id != session_id:
                        filtered_by_session += 1
                        continue
                
                # Filter by document_ids if provided (non-empty list) - STRICT filtering
                if document_ids and len(document_ids) > 0:
                    # Document MUST have a document_id and it MUST be in the provided list
                    if not doc_id or doc_id not in document_ids:
                        filtered_by_doc_id += 1
                        continue
                
                # Apply learning style boost
                style_score = self._calculate_style_score(doc, learning_style)
                
                # Priority boost system:
                # 1. Highest priority: documents matching provided document_ids (2x boost)
                # 2. High priority: documents from current session (1.5x boost)
                # 3. Normal priority: other documents (1x)
                priority_multiplier = 1.0
                if document_ids and len(document_ids) > 0 and doc_id in document_ids:
                    # Maximum priority for explicitly requested documents
                    priority_multiplier = 2.0
                elif session_id and doc_session_id == session_id:
                    # High priority for current session documents
                    priority_multiplier = 1.5
                
                # Combine scores with priority boost
                base_score = float(score) * 0.7 + style_score * 0.3
                combined_score = base_score * priority_multiplier
                
                results.append({
                    **doc,
                    "semantic_score": float(score),
                    "style_score": style_score,
                    "priority_multiplier": priority_multiplier,
                    "combined_score": combined_score
                })
        
        # Re-rank by combined score (with priority boost)
        results.sort(key=lambda x: x['combined_score'], reverse=True)
        
        # Debug logging
        if len(results) == 0:
            print(f"⚠️ No results after filtering! Checked {total_checked} documents")
            print(f"   - Filtered by session_id: {filtered_by_session}")
            print(f"   - Filtered by document_ids: {filtered_by_doc_id}")
            print(f"   - Requested session_id: {session_id}")
            print(f"   - Requested document_ids: {document_ids}")
        
        return results[:k]

    def _calculate_style_score(self, doc: Dict, learning_style: Dict) -> float:
        """Calculate how well content matches learning style"""
        score = 0.5  # Base score
        content_type = doc['metadata'].get('content_type', {})
        
        # Sensing vs Intuitive
        if learning_style.get('perception') == 'sensing':
            if content_type.get('has_examples'):
                score += 0.2
            if content_type.get('is_detailed'):
                score += 0.1
        elif learning_style.get('perception') == 'intuitive':
            if content_type.get('has_theory'):
                score += 0.2
            if content_type.get('has_overview'):
                score += 0.1
        
        # Sequential vs Global
        if learning_style.get('understanding') == 'sequential':
            if content_type.get('has_steps'):
                score += 0.15
        elif learning_style.get('understanding') == 'global':
            if content_type.get('has_overview'):
                score += 0.15
        
        # Active vs Reflective
        if learning_style.get('processing') == 'active':
            if content_type.get('is_concise'):
                score += 0.1
            if content_type.get('has_examples'):
                score += 0.1
        elif learning_style.get('processing') == 'reflective':
            if content_type.get('is_detailed'):
                score += 0.1
        
        return min(1.0, score)

    def similarity_search(
        self, 
        query: str, 
        k: int = 5,
        session_id: str = None,
        document_ids: List[str] = None
    ) -> List[Dict]:
        """Standard similarity search with optional filtering"""
        if self.index is None or len(self.documents) == 0:
            return []
        query_embedding = self.embedding_model.embed_query(query)
        query_np = np.array([query_embedding]).astype("float32")
        faiss.normalize_L2(query_np)
        
        # When filtering by session_id or document_ids, we need to search through
        # a much larger set to find matching documents, since they might not be
        # in the top similarity results
        if session_id or (document_ids and len(document_ids) > 0):
            # Search through a large portion of documents when filtering
            search_k = min(len(self.documents), max(k * 20, 200))  # Search more when filtering
            print(f"   🔎 Filtering active - searching through {search_k} documents")
        else:
            search_k = min(k * 5, len(self.documents))  # Normal search
        scores, indices = self.index.search(query_np, search_k)
        
        results = []
        total_checked = 0
        filtered_by_session = 0
        filtered_by_doc_id = 0
        sample_metadata_shown = False
        
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:
                total_checked += 1
                doc = self.documents[idx]
                metadata = doc.get("metadata", {})
                doc_id = metadata.get("document_id")
                doc_session_id = metadata.get("session_id")
                
                # Debug: Show sample metadata for first few documents
                if not sample_metadata_shown and total_checked <= 3:
                    print(f"   📋 Sample doc {total_checked} metadata: session_id={doc_session_id}, document_id={doc_id}")
                    if total_checked == 3:
                        sample_metadata_shown = True
                
                # STRICT filtering: If session_id or document_ids are provided, 
                # only include documents with proper metadata
                if session_id:
                    # If session_id is provided, document MUST have matching session_id
                    if not doc_session_id or doc_session_id != session_id:
                        filtered_by_session += 1
                        continue
                
                # Filter by document_ids if provided (non-empty list) - STRICT filtering
                if document_ids and len(document_ids) > 0:
                    # Document MUST have a document_id and it MUST be in the provided list
                    if not doc_id or doc_id not in document_ids:
                        filtered_by_doc_id += 1
                        continue
                
                # Priority boost system:
                # 1. Highest priority: documents matching provided document_ids (2x boost)
                # 2. High priority: documents from current session (1.5x boost)
                # 3. Normal priority: other documents (1x)
                priority_multiplier = 1.0
                if document_ids and len(document_ids) > 0 and doc_id in document_ids:
                    # Maximum priority for explicitly requested documents
                    priority_multiplier = 2.0
                elif session_id and doc_session_id == session_id:
                    # High priority for current session documents
                    priority_multiplier = 1.5
                
                # Apply priority boost to score
                boosted_score = float(score) * priority_multiplier
                
                results.append({
                    **doc, 
                    "score": float(score),
                    "priority_multiplier": priority_multiplier,
                    "boosted_score": boosted_score
                })
                
                # Stop if we have enough results
                if len(results) >= k:
                    break
        
        # Re-rank by boosted score to ensure priority documents come first
        results.sort(key=lambda x: x.get('boosted_score', x.get('score', 0)), reverse=True)
        
        # Debug logging
        if len(results) == 0:
            print(f"⚠️ No results after filtering! Checked {total_checked} documents")
            print(f"   - Filtered by session_id: {filtered_by_session}")
            print(f"   - Filtered by document_ids: {filtered_by_doc_id}")
            print(f"   - Requested session_id: {session_id}")
            print(f"   - Requested document_ids: {document_ids}")
        
        return results[:k]

    def save_index(self, path: str):
        if self.index is not None:
            faiss.write_index(self.index, f"{path}.faiss")
            with open(f"{path}.pkl", "wb") as f:
                pickle.dump(self.documents, f)

    def load_index(self, path: str):
        try:
            if os.path.exists(f"{path}.faiss") and os.path.exists(f"{path}.pkl"):
                self.index = faiss.read_index(f"{path}.faiss")
                with open(f"{path}.pkl", "rb") as f:
                    self.documents = pickle.load(f)
                return True
        except Exception as e:
            print(f"Error loading index: {e}")
        return False