"""
Agent Service for RAG System
Manages intelligent agent orchestration with tool integration
"""

import json
import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import traceback

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from .tools_manager import tools_manager


class AgentState(Enum):
    """Agent execution states"""
    IDLE = "idle"
    THINKING = "thinking"
    USING_TOOL = "using_tool"
    GENERATING_RESPONSE = "generating_response"
    DONE = "done"
    ERROR = "error"


@dataclass
class AgentStep:
    """Represents one step in agent reasoning"""
    step_number: int
    state: AgentState
    thought: str
    action: Optional[str] = None
    action_params: Optional[Dict] = None
    observation: Optional[str] = None
    reasoning: Optional[str] = None


class AgentMemory:
    """Memory system for agent reasoning"""
    
    def __init__(self, session_id: str, max_history: int = 20):
        self.session_id = session_id
        self.max_history = max_history
        self.thoughts: List[str] = []
        self.actions: List[Dict] = []
        self.observations: List[Dict] = []
    
    def add_thought(self, thought: str):
        """Add a thought to memory"""
        self.thoughts.append(thought)
        if len(self.thoughts) > self.max_history:
            self.thoughts.pop(0)
    
    def add_action(self, action: Dict):
        """Add an action to memory"""
        self.actions.append(action)
        if len(self.actions) > self.max_history:
            self.actions.pop(0)
    
    def add_observation(self, observation: Dict):
        """Add an observation to memory"""
        self.observations.append(observation)
        if len(self.observations) > self.max_history:
            self.observations.pop(0)
    
    def get_context(self) -> str:
        """Get formatted context from memory"""
        context = "## Agent Memory Context\n\n"
        
        if self.thoughts:
            context += "### Recent Thoughts\n"
            for thought in self.thoughts[-5:]:
                context += f"- {thought}\n"
            context += "\n"
        
        if self.observations:
            context += "### Recent Observations\n"
            for obs in self.observations[-5:]:
                content = obs.get("content", "")[:100]
                context += f"- {obs.get('source', 'unknown')}: {content}\n"
            context += "\n"
        
        return context


class ReasoningAgent:
    """Intelligent reasoning agent with tool integration"""
    
    def __init__(self, llm_client, embedding_model=None):
        """
        Initialize the agent
        
        Args:
            llm_client: The LLM client for reasoning
            embedding_model: Optional embedding model for semantic analysis
        """
        self.llm_client = llm_client
        self.embedding_model = embedding_model
        self.session_memories: Dict[str, AgentMemory] = {}
        self.max_iterations = 10
        self.tools_manager = tools_manager
    
    def get_memory(self, session_id: str) -> AgentMemory:
        """Get or create memory for a session"""
        if session_id not in self.session_memories:
            self.session_memories[session_id] = AgentMemory(session_id)
        return self.session_memories[session_id]
    
    def _parse_agent_response(self, response_text: str) -> Dict:
        """Parse agent response for thought, action, and observation"""
        lines = response_text.split("\n")
        
        thought = ""
        action = None
        action_params = {}
        
        current_section = None
        action_text = ""
        
        for line in lines:
            line = line.strip()
            
            if line.startswith("Thought:"):
                current_section = "thought"
                thought = line.replace("Thought:", "").strip()
            elif line.startswith("Action:"):
                current_section = "action"
                action = line.replace("Action:", "").strip()
            elif line.startswith("Action Input:"):
                current_section = "action_input"
                action_text = line.replace("Action Input:", "").strip()
            elif current_section == "action_input":
                action_text += line
        
        # Try to parse action_text as JSON
        if action_text:
            try:
                action_params = json.loads(action_text)
            except json.JSONDecodeError:
                action_params = {"raw": action_text}
        
        return {
            "thought": thought,
            "action": action,
            "action_params": action_params
        }
    
    def _build_system_prompt(self, session_id: str) -> str:
        """Build the system prompt with tool information"""
        memory = self.get_memory(session_id)
        tools_info = self.tools_manager.get_tool_list()
        
        enabled_tools = [name for name, info in tools_info["tools"].items() if info["enabled"]]
        
        tools_descriptions = {
            # PRIMARY Search Tool (BEST - use first)
            "searchapi": "🎯 SearchApi (PRIMARY) - Best accuracy universal search API",
            
            # DEFAULT - Always active for search
            "google_serper": "🔍 Google Serper - Real-time web search for current information",
            "tavily_search": "🔎 Tavily Search - AI-optimized search for relevant results",
            "duckduckgo": "🦆 DuckDuckGo - Privacy-focused web search alternative",
            "brave_search": "🛡️ Brave Search - Privacy-focused search engine",
            "wikipedia": "📖 Wikipedia - Encyclopedic information and general knowledge",
            "google_scholar": "🎓 Google Scholar - Academic papers and research publications",
            "arxiv": "📚 ArXiv - Academic papers and preprints",
            "youtube": "🎥 YouTube - Video search and tutorials",
            "playwright": "🌐 Playwright - Web browsing and page content extraction",
            
            # CONDITIONAL - Use if needed
            "robocorp": "🤖 Robocorp - Automation and RPA tasks",
            "weather": "🌤️ Weather - Current weather information for any city",
            "code_interpreter": "💻 Code Interpreter - Execute Python code for analysis",
            "shell": "🖥️ Shell - Execute terminal commands (git, npm, pip, etc)",
            "github": "🐙 GitHub - Repository and code search",
            "wikidata": "🏛️ Wikidata - Query structured knowledge base with SPARQL",
            "matplotlib": "📊 Matplotlib - Create data visualizations and plots"
        }
        
        # Separate primary, default and conditional tools
        primary_tools = ["searchapi"]
        default_tools = ["google_serper", "tavily_search", "duckduckgo", "brave_search", "wikipedia", "google_scholar", "arxiv", "youtube", "playwright"]
        conditional_tools = ["robocorp", "weather", "code_interpreter", "shell", "github", "wikidata", "matplotlib"]
        
        primary_tools_list = "\n".join([
            f"- {name}: {tools_descriptions.get(name, 'Tool for ' + name)}"
            for name in enabled_tools if name in primary_tools
        ])
        
        default_tools_list = "\n".join([
            f"- {name}: {tools_descriptions.get(name, 'Tool for ' + name)}"
            for name in enabled_tools if name in default_tools
        ])
        
        conditional_tools_list = "\n".join([
            f"- {name}: {tools_descriptions.get(name, 'Tool for ' + name)}"
            for name in enabled_tools if name in conditional_tools
        ])
        
        system_prompt = f"""You are an intelligent reasoning agent designed to solve complex tasks by breaking them down into steps and using available tools.

## 🎯 PRIMARY TOOL (Best Accuracy - Use First)
{primary_tools_list if primary_tools_list else "SearchApi is not configured"}

## 🔍 DEFAULT TOOLS (Always Available)
Always available for search, browsing, and research (if SearchApi not available, use these):
{default_tools_list}

## 🔧 CONDITIONAL TOOLS (Use When Needed)
Use these specialized tools if the question requires them:
{conditional_tools_list}

## 📋 Tool Selection Strategy
1. **FIRST CHOICE**: Use SearchApi for best accuracy (if configured)
2. **FALLBACK Search**: Google Serper, Tavily, DuckDuckGo, Brave Search
3. **For general knowledge**: Use Wikipedia
4. **For academic content**: Use Google Scholar, ArXiv
5. **For video tutorials/content**: Use YouTube
6. **For detailed web content**: Use Playwright web browsing
7. **For automation tasks**: Use Robocorp
8. **For weather data**: Use Weather tool if user asks about weather
9. **For coding problems**: Use Code Interpreter
10. **For repository/open-source code**: Use GitHub
11. **For terminal commands**: Use Shell

## Your Reasoning Process
For each user query, you should:
1. **Analyze** the question type and what information is needed
2. **Select Tools** - Try SearchApi first, fallback to default tools, conditional tools only if needed
3. **Execute** tool calls to gather information from multiple sources
4. **Synthesize** results into a coherent answer
5. **Validate** information across sources when possible

## Response Format
When you need to use a tool, respond in this exact format:

Thought: <Your reasoning about what to do next>
Action: <The tool name to use>
Action Input: <JSON with parameters, e.g., {{"query": "...", "num_results": 5}}>

When you have enough information to answer, provide a comprehensive response.

## Memory Context
{memory.get_context()}

## Guidelines
- Always try SearchApi and Tavily Search first for best results (if API key configured)
- If SearchApi not available, use Google Serper and DuckDuckGo Search as fallback
- Cross-reference information from multiple sources when available
- If document context is available, enhance it with current information
- Be clear about the sources of information
- If you're not sure about something, say so
- Use multiple search tools for important facts verification
- Only use conditional tools if the question specifically requires them
- Be efficient: stop searching once you have enough quality information
- Max iterations: 3 - Use them wisely to get best results"""
        
        return system_prompt
    
    async def think(self, message: str, session_id: str, context: str = "") -> Dict:
        """
        Let the agent think about a message and decide on actions
        
        Args:
            message: The user's message
            session_id: Session identifier
            context: Additional context (e.g., from RAG)
        
        Returns:
            Agent's reasoning with suggested actions
        """
        try:
            memory = self.get_memory(session_id)
            memory.add_thought(message)
            
            system_prompt = self._build_system_prompt(session_id)
            
            user_message = f"{message}\n\nAdditional Context:\n{context}" if context else message
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ]
            
            print(f"🧠 [Agent] Thinking about: {message[:50]}...")
            
            response = await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.llm_client.invoke(messages)
            )
            
            parsed = self._parse_agent_response(response.content)
            
            print(f"💭 [Agent] Thought: {parsed['thought'][:100]}")
            if parsed['action']:
                print(f"🔧 [Agent] Action: {parsed['action']}")
            
            return {
                "status": "success",
                "thought": parsed["thought"],
                "action": parsed["action"],
                "action_params": parsed["action_params"],
                "full_response": response.content
            }
        
        except Exception as e:
            print(f"❌ Error in agent thinking: {e}")
            traceback.print_exc()
            return {"status": "error", "error": str(e)}
    
    async def execute_action(self, action: str, params: Dict) -> Dict:
        """
        Execute a tool action
        
        Args:
            action: Tool name to execute
            params: Parameters for the tool
        
        Returns:
            Tool execution result
        """
        try:
            print(f"🔧 [Agent] Executing action: {action}")
            result = await self.tools_manager.use_tool(action, **params)
            print(f"✅ [Agent] Action completed: {action}")
            return result
        except Exception as e:
            print(f"❌ Error executing action: {e}")
            return {"error": str(e), "action": action}
    
    async def reason_and_act(
        self,
        message: str,
        session_id: str,
        context: str = "",
        enable_tools: bool = True,
        max_iterations: int = None
    ) -> Dict:
        """
        Full reasoning and action loop
        
        Args:
            message: User message
            session_id: Session ID
            context: Additional context
            enable_tools: Whether to enable tool usage
            max_iterations: Maximum reasoning iterations
        
        Returns:
            Final response with reasoning chain
        """
        memory = self.get_memory(session_id)
        reasoning_chain = []
        iterations = 0
        max_iter = max_iterations or self.max_iterations
        
        current_message = message
        
        print(f"\n🤖 [Agent] Starting reasoning loop for: {message[:50]}...")
        
        while iterations < max_iter:
            iterations += 1
            print(f"\n📍 [Agent] Iteration {iterations}/{max_iter}")
            
            # Think phase
            think_result = await self.think(current_message, session_id, context)
            
            if think_result["status"] == "error":
                return {
                    "status": "error",
                    "error": think_result["error"],
                    "reasoning_chain": reasoning_chain
                }
            
            reasoning_chain.append({
                "iteration": iterations,
                "type": "thought",
                "thought": think_result["thought"],
                "action": think_result.get("action"),
                "action_params": think_result.get("action_params")
            })
            
            # Check if agent has decided to answer
            if not think_result.get("action"):
                print(f"✅ [Agent] Ready to answer")
                return {
                    "status": "success",
                    "final_response": think_result["full_response"],
                    "reasoning_chain": reasoning_chain,
                    "iterations": iterations
                }
            
            # Action phase
            if enable_tools:
                action_result = await self.execute_action(
                    think_result["action"],
                    think_result.get("action_params", {})
                )
                
                reasoning_chain.append({
                    "iteration": iterations,
                    "type": "action",
                    "action": think_result["action"],
                    "result": action_result
                })
                
                # Add observation to memory
                memory.add_observation({
                    "source": think_result["action"],
                    "content": json.dumps(action_result)[:500]
                })
                
                # Continue reasoning with the result
                if "error" not in action_result:
                    current_message = f"Here's the result from using {think_result['action']}:\n{json.dumps(action_result)}\n\nNow, based on this information, please continue reasoning about the original question: {message}"
                else:
                    current_message = f"The tool {think_result['action']} returned an error: {action_result['error']}\n\nPlease try a different approach or tool for: {message}"
            else:
                print(f"⚠️ [Agent] Tools disabled, returning current response")
                return {
                    "status": "success",
                    "final_response": think_result["full_response"],
                    "reasoning_chain": reasoning_chain,
                    "iterations": iterations
                }
        
        print(f"⚠️ [Agent] Reached maximum iterations ({max_iter})")
        return {
            "status": "max_iterations_reached",
            "reasoning_chain": reasoning_chain,
            "iterations": iterations,
            "note": "Agent reasoning exceeded maximum iterations"
        }
    
    def clear_memory(self, session_id: str):
        """Clear memory for a session"""
        if session_id in self.session_memories:
            del self.session_memories[session_id]
            print(f"✅ Cleared memory for session: {session_id}")
    
    def get_memory_summary(self, session_id: str) -> Dict:
        """Get summary of agent memory"""
        memory = self.get_memory(session_id)
        return {
            "session_id": session_id,
            "thoughts_count": len(memory.thoughts),
            "actions_count": len(memory.actions),
            "observations_count": len(memory.observations),
            "recent_thoughts": memory.thoughts[-3:],
            "recent_actions": memory.actions[-3:]
        }
