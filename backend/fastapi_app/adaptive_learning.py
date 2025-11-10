# adaptive_learning.py

import json
from typing import Dict, List, Optional
from datetime import datetime
import os
import numpy as np
import faiss
import pickle
from langchain_huggingface import HuggingFaceEmbeddings
from config import settings


class ILSLearningProfile:
    """Tracks and analyzes user learning patterns based on ILS method"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.dimensions = {
            'active_reflective': 0,  # -11 to +11 (negative=active, positive=reflective)
            'sensing_intuitive': 0,  # -11 to +11 (negative=sensing, positive=intuitive)
            'visual_verbal': 0,      # -11 to +11 (negative=visual, positive=verbal)
            'sequential_global': 0   # -11 to +11 (negative=sequential, positive=global)
        }
        self.interaction_history = []
        self.total_interactions = 0
    
    def analyze_message_patterns(self, message: str, response_time: float = None):
        """Automatically detect learning patterns from user message"""
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
        
        return indicators
    
    def update_from_interaction(self, indicators: Dict):
        """Update learning profile based on detected indicators"""
        # Active vs Reflective
        if indicators.get('active_learning'):
            self.dimensions['active_reflective'] = max(-11, self.dimensions['active_reflective'] - 1)
        if indicators.get('reflective_learning'):
            self.dimensions['active_reflective'] = min(11, self.dimensions['active_reflective'] + 1)
        if indicators.get('brief_communication'):
            self.dimensions['active_reflective'] = max(-11, self.dimensions['active_reflective'] - 0.5)
        
        # Sensing vs Intuitive
        if indicators.get('sensing_preference'):
            self.dimensions['sensing_intuitive'] = max(-11, self.dimensions['sensing_intuitive'] - 1)
        if indicators.get('intuitive_preference'):
            self.dimensions['sensing_intuitive'] = min(11, self.dimensions['sensing_intuitive'] + 1)
        
        # Visual vs Verbal
        if indicators.get('visual_preference'):
            self.dimensions['visual_verbal'] = max(-11, self.dimensions['visual_verbal'] - 1)
        if indicators.get('verbal_preference'):
            self.dimensions['visual_verbal'] = min(11, self.dimensions['visual_verbal'] + 1)
        
        # Sequential vs Global
        if indicators.get('sequential_preference'):
            self.dimensions['sequential_global'] = max(-11, self.dimensions['sequential_global'] - 1)
        if indicators.get('global_preference'):
            self.dimensions['sequential_global'] = min(11, self.dimensions['sequential_global'] + 1)
        
        self.total_interactions += 1
        self.interaction_history.append({
            'timestamp': datetime.now().isoformat(),
            'indicators': indicators,
            'dimensions': self.dimensions.copy()
        })
    
    def get_learning_style(self) -> Dict[str, str]:
        """Get current learning style classification"""
        style = {}
        
        # Classify each dimension (moderate preference at ±3, strong at ±7)
        ar = self.dimensions['active_reflective']
        if abs(ar) >= 3:
            style['processing'] = 'active' if ar < 0 else 'reflective'
            style['processing_strength'] = 'strong' if abs(ar) >= 7 else 'moderate'
        else:
            style['processing'] = 'balanced'
            style['processing_strength'] = 'balanced'
        
        si = self.dimensions['sensing_intuitive']
        if abs(si) >= 3:
            style['perception'] = 'sensing' if si < 0 else 'intuitive'
            style['perception_strength'] = 'strong' if abs(si) >= 7 else 'moderate'
        else:
            style['perception'] = 'balanced'
            style['perception_strength'] = 'balanced'
        
        vv = self.dimensions['visual_verbal']
        if abs(vv) >= 3:
            style['input'] = 'visual' if vv < 0 else 'verbal'
            style['input_strength'] = 'strong' if abs(vv) >= 7 else 'moderate'
        else:
            style['input'] = 'balanced'
            style['input_strength'] = 'balanced'
        
        sg = self.dimensions['sequential_global']
        if abs(sg) >= 3:
            style['understanding'] = 'sequential' if sg < 0 else 'global'
            style['understanding_strength'] = 'strong' if abs(sg) >= 7 else 'moderate'
        else:
            style['understanding'] = 'balanced'
            style['understanding_strength'] = 'balanced'
        
        return style
    
    def to_dict(self) -> Dict:
        """Serialize profile to dictionary"""
        return {
            'user_id': self.user_id,
            'dimensions': self.dimensions,
            'total_interactions': self.total_interactions,
            'interaction_history': self.interaction_history[-10:]  # Keep last 10
        }
    
    @classmethod
    def from_dict(cls, data: Dict):
        """Deserialize profile from dictionary"""
        profile = cls(data['user_id'])
        profile.dimensions = data.get('dimensions', profile.dimensions)
        profile.total_interactions = data.get('total_interactions', 0)
        profile.interaction_history = data.get('interaction_history', [])
        return profile


class AdaptiveSystemPromptGenerator:
    """Generates custom system prompts based on ILS learning profiles"""
    
    @staticmethod
    def generate_prompt(learning_profile: ILSLearningProfile, context: str) -> str:
        """Generate customized system prompt based on learning style"""
        style = learning_profile.get_learning_style()
        
        base_prompt = "You are an intelligent adaptive learning assistant with strong reasoning abilities. "
        
        # Add adaptive instructions based on learning style
        adaptations = []
        
        # Processing style (Active/Reflective)
        if style['processing'] == 'active':
            adaptations.append(
                "The learner prefers active engagement and hands-on learning. "
                "Provide practical exercises, actionable steps, and encourage immediate application. "
                "Keep explanations concise and focus on what they can do right away."
            )
        elif style['processing'] == 'reflective':
            adaptations.append(
                "The learner prefers thoughtful reflection before action. "
                "Provide comprehensive explanations, encourage analysis, and allow time for understanding. "
                "Include thought-provoking questions and deeper reasoning."
            )
        
        # Perception style (Sensing/Intuitive)
        if style['perception'] == 'sensing':
            adaptations.append(
                "Focus on concrete facts, real-world examples, and practical applications. "
                "Provide specific, detailed procedures with proven methods. "
                "Use data, statistics, and tangible examples."
            )
        elif style['perception'] == 'intuitive':
            adaptations.append(
                "Focus on concepts, theories, and innovative possibilities. "
                "Discuss underlying principles, abstract ideas, and future implications. "
                "Encourage creative thinking and exploration of new approaches."
            )
        
        # Input style (Visual/Verbal)
        if style['input'] == 'visual':
            adaptations.append(
                "Emphasize visual thinking and spatial relationships. "
                "Describe visual patterns, suggest creating diagrams or charts. "
                "Use metaphors with visual imagery and describe how things look or flow."
            )
        elif style['input'] == 'verbal':
            adaptations.append(
                "Emphasize clear written and verbal explanations. "
                "Provide detailed textual descriptions and well-structured written instructions. "
                "Use precise language and clear definitions."
            )
        
        # Understanding style (Sequential/Global)
        if style['understanding'] == 'sequential':
            adaptations.append(
                "Present information in a clear, step-by-step sequence. "
                "Build understanding incrementally with logical progression. "
                "Number steps and show clear cause-and-effect relationships."
            )
        elif style['understanding'] == 'global':
            adaptations.append(
                "Start with the big picture and overall context first. "
                "Show how details connect to the whole system. "
                "Allow non-linear exploration and highlight relationships between concepts."
            )
        
        if adaptations:
            base_prompt += "\n\n**Learning Style Adaptations:**\n" + "\n".join(adaptations)
        
        # Add context instructions
        base_prompt += (
            "\n\n**Instructions:**\n"
            "- Use the following context to answer questions accurately\n"
            "- Think step by step and provide clear reasoning\n"
            "- If you don't know the answer based on the context, say so honestly\n"
            "- Adapt your teaching style to match the learner's preferences while maintaining accuracy\n"
            f"\n**Context:**\n{context}"
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
        k: int = 5
    ) -> List[Dict]:
        """Search with learning style-based re-ranking"""
        if self.index is None or len(self.documents) == 0:
            return []
        
        # Get initial results (fetch more than k for re-ranking)
        query_embedding = self.embedding_model.embed_query(query)
        query_np = np.array([query_embedding]).astype("float32")
        faiss.normalize_L2(query_np)
        
        search_k = min(k * 3, len(self.documents))  # Get 3x for re-ranking
        scores, indices = self.index.search(query_np, search_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:
                doc = self.documents[idx]
                # Apply learning style boost
                style_score = self._calculate_style_score(doc, learning_style)
                combined_score = float(score) * 0.7 + style_score * 0.3
                
                results.append({
                    **doc,
                    "semantic_score": float(score),
                    "style_score": style_score,
                    "combined_score": combined_score
                })
        
        # Re-rank by combined score
        results.sort(key=lambda x: x['combined_score'], reverse=True)
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

    def similarity_search(self, query: str, k: int = 5) -> List[Dict]:
        """Standard similarity search (backward compatibility)"""
        if self.index is None or len(self.documents) == 0:
            return []
        query_embedding = self.embedding_model.embed_query(query)
        query_np = np.array([query_embedding]).astype("float32")
        faiss.normalize_L2(query_np)
        scores, indices = self.index.search(query_np, min(k, len(self.documents)))
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:
                results.append({**self.documents[idx], "score": float(score)})
        return results

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