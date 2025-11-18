"""
Tools Manager for RAG Agent System
Manages all external tools like search, code execution, weather, etc.
"""

import os
import asyncio
import json
from typing import Any, Dict, List, Optional
from datetime import datetime
import traceback
from dataclasses import dataclass
from enum import Enum

# Import settings
from config import settings

# Import tool libraries
try:
    from langchain_community.tools import Tool
except ImportError:
    pass

try:
    from langchain_community.utilities import DuckDuckGoSearchAPIWrapper
except ImportError:
    DuckDuckGoSearchAPIWrapper = None

try:
    from langchain_community.utilities import GoogleSerperAPIWrapper
except ImportError:
    GoogleSerperAPIWrapper = None

# Define tool categories
class ToolCategory(Enum):
    SEARCH = "search"
    CODE_EXECUTION = "code_execution"
    BROWSER = "browser"
    DATA_ANALYSIS = "data_analysis"
    RESEARCH = "research"
    WEATHER = "weather"
    GIT = "git"
    COMPOSITION = "composition"


@dataclass
class ToolConfig:
    """Configuration for a tool"""
    name: str
    category: ToolCategory
    description: str
    enabled: bool = True
    api_key_env: Optional[str] = None
    requires_api_key: bool = False


class GoogleSerperTool:
    """Google Serper Search Tool"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GOOGLE_SERPER_API_KEY or os.getenv("GOOGLE_SERPER_API_KEY")
        self.enabled = bool(self.api_key)
    
    async def search(self, query: str, num_results: int = 5) -> Dict:
        """Search using Google Serper"""
        if not self.enabled:
            return {"error": "Google Serper API key not configured"}
        
        try:
            # Try using langchain wrapper if available
            if GoogleSerperAPIWrapper:
                wrapper = GoogleSerperAPIWrapper(serper_api_key=self.api_key)
                results = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: wrapper.results(query)
                )
            else:
                # Fallback: Direct API call
                import aiohttp
                
                url = "https://google.serper.dev/search"
                headers = {
                    "X-API-KEY": self.api_key,
                    "Content-Type": "application/json"
                }
                params = {
                    "q": query,
                    "num": num_results
                }
                
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, headers=headers, params=params) as response:
                        if response.status == 200:
                            results = await response.json()
                        else:
                            return {"error": f"Google Serper API error: {response.status}"}
            
            formatted_results = {
                "query": query,
                "results": results.get("organic", [])[:num_results],
                "answer_box": results.get("answerBox", {}),
                "knowledge_graph": results.get("knowledgeGraph", {}),
                "tool": "google_serper"
            }
            return formatted_results
        except Exception as e:
            print(f"❌ Google Serper error: {e}")
            traceback.print_exc()
            return {"error": str(e)}


class DuckDuckGoSearchTool:
    """DuckDuckGo Search Tool"""
    
    def __init__(self):
        self.enabled = True
    
    async def search(self, query: str, num_results: int = 5) -> Dict:
        """Search using DuckDuckGo"""
        try:
            wrapper = DuckDuckGoSearchAPIWrapper()
            results = await asyncio.get_event_loop().run_in_executor(
                None, lambda: wrapper.results(query, num_results)
            )
            
            return {
                "query": query,
                "results": results[:num_results],
                "tool": "duckduckgo"
            }
        except Exception as e:
            print(f"❌ DuckDuckGo error: {e}")
            return {"error": str(e)}


class WikipediaTool:
    """Wikipedia Search Tool"""
    
    def __init__(self):
        self.enabled = True
    
    async def search(self, query: str) -> Dict:
        """Search Wikipedia"""
        try:
            import wikipedia
            
            results = await asyncio.get_event_loop().run_in_executor(
                None, lambda: wikipedia.search(query, results=5)
            )
            
            summaries = []
            for title in results:
                try:
                    page = await asyncio.get_event_loop().run_in_executor(
                        None, lambda t=title: wikipedia.page(t)
                    )
                    summaries.append({
                        "title": page.title,
                        "url": page.url,
                        "summary": page.summary[:500],
                        "content": page.content[:1000]
                    })
                except:
                    pass
            
            return {
                "query": query,
                "results": summaries,
                "tool": "wikipedia"
            }
        except Exception as e:
            print(f"❌ Wikipedia error: {e}")
            return {"error": str(e)}


class ArxivTool:
    """ArXiv Research Paper Tool"""
    
    def __init__(self):
        self.enabled = True
    
    async def search(self, query: str, max_results: int = 5) -> Dict:
        """Search ArXiv for papers"""
        try:
            import arxiv
            
            client = arxiv.Client()
            
            def _search():
                return list(client.results(
                    arxiv.Search(
                        query=query,
                        max_results=max_results,
                        sort_by=arxiv.SortCriterion.Relevance
                    )
                ))
            
            papers = await asyncio.get_event_loop().run_in_executor(None, _search)
            
            results = []
            for paper in papers:
                results.append({
                    "title": paper.title,
                    "authors": [author.name for author in paper.authors],
                    "published": paper.published.isoformat(),
                    "summary": paper.summary,
                    "arxiv_url": paper.arxiv_url,
                    "pdf_url": paper.pdf_url
                })
            
            return {
                "query": query,
                "results": results,
                "tool": "arxiv"
            }
        except Exception as e:
            print(f"❌ ArXiv error: {e}")
            return {"error": str(e)}


class YoutubeSearchTool:
    """YouTube Search Tool"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.YOUTUBE_API_KEY or os.getenv("YOUTUBE_API_KEY")
        self.enabled = bool(self.api_key)
    
    async def search(self, query: str, max_results: int = 5) -> Dict:
        """Search YouTube"""
        if not self.enabled:
            return {"error": "YouTube API key not configured"}
        
        try:
            from googleapiclient.discovery import build
            
            youtube = build("youtube", "v3", developerKey=self.api_key)
            
            def _search():
                request = youtube.search().list(
                    q=query,
                    part="snippet",
                    maxResults=max_results,
                    type="video"
                )
                return request.execute()
            
            response = await asyncio.get_event_loop().run_in_executor(None, _search)
            
            results = []
            for item in response.get("items", []):
                results.append({
                    "title": item["snippet"]["title"],
                    "channel": item["snippet"]["channelTitle"],
                    "description": item["snippet"]["description"],
                    "video_id": item["id"]["videoId"],
                    "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
                })
            
            return {
                "query": query,
                "results": results,
                "tool": "youtube"
            }
        except Exception as e:
            print(f"❌ YouTube error: {e}")
            return {"error": str(e)}


class WeatherTool:
    """OpenWeatherMap Tool"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.OPENWEATHERMAP_API_KEY or os.getenv("OPENWEATHERMAP_API_KEY")
        self.enabled = bool(self.api_key)
    
    async def get_weather(self, city: str) -> Dict:
        """Get current weather for a city"""
        if not self.enabled:
            return {"error": "OpenWeatherMap API key not configured"}
        
        try:
            import aiohttp
            
            url = f"https://api.openweathermap.org/data/2.5/weather"
            params = {
                "q": city,
                "appid": self.api_key,
                "units": "metric"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "city": data["name"],
                            "country": data["sys"]["country"],
                            "temperature": data["main"]["temp"],
                            "feels_like": data["main"]["feels_like"],
                            "humidity": data["main"]["humidity"],
                            "pressure": data["main"]["pressure"],
                            "description": data["weather"][0]["description"],
                            "wind_speed": data["wind"]["speed"],
                            "tool": "openweathermap"
                        }
                    else:
                        return {"error": f"Weather API error: {response.status}"}
        except Exception as e:
            print(f"❌ Weather error: {e}")
            return {"error": str(e)}


class CodeInterpreterTool:
    """Riza Code Interpreter Tool"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.RIZA_API_KEY or os.getenv("RIZA_API_KEY")
        self.enabled = bool(self.api_key)
    
    async def execute_code(self, code: str, language: str = "python") -> Dict:
        """Execute code using Riza Code Interpreter"""
        if not self.enabled:
            return {"error": "Riza API key not configured"}
        
        try:
            import aiohttp
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "code": code,
                "language": language
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.riza.io/v1/code_execution",
                    json=payload,
                    headers=headers
                ) as response:
                    result = await response.json()
                    return {
                        "output": result.get("output", ""),
                        "stdout": result.get("stdout", ""),
                        "stderr": result.get("stderr", ""),
                        "status": result.get("status", ""),
                        "tool": "riza"
                    }
        except Exception as e:
            print(f"❌ Riza code execution error: {e}")
            return {"error": str(e)}


class GithubToolkit:
    """GitHub Toolkit for repository operations"""
    
    def __init__(self, token: str = None):
        self.token = token or settings.GITHUB_TOKEN or os.getenv("GITHUB_TOKEN")
        self.enabled = bool(self.token)
    
    async def search_repos(self, query: str, max_results: int = 5) -> Dict:
        """Search GitHub repositories"""
        if not self.enabled:
            return {"error": "GitHub token not configured"}
        
        try:
            from github import Github
            
            g = Github(self.token)
            
            def _search():
                repos = g.search_repositories(query)
                return list(repos[:max_results])
            
            repos = await asyncio.get_event_loop().run_in_executor(None, _search)
            
            results = []
            for repo in repos:
                results.append({
                    "name": repo.name,
                    "full_name": repo.full_name,
                    "url": repo.html_url,
                    "description": repo.description,
                    "stars": repo.stargazers_count,
                    "language": repo.language,
                    "updated_at": repo.updated_at.isoformat()
                })
            
            return {
                "query": query,
                "results": results,
                "tool": "github"
            }
        except Exception as e:
            print(f"❌ GitHub search error: {e}")
            return {"error": str(e)}


class PlaywrightBrowserTool:
    """Playwright Browser Automation Tool"""
    
    def __init__(self):
        self.enabled = True
    
    async def fetch_page(self, url: str) -> Dict:
        """Fetch and parse a web page"""
        try:
            from playwright.async_api import async_playwright
            
            async with async_playwright() as p:
                browser = await p.chromium.launch()
                page = await browser.new_page()
                await page.goto(url, wait_until="networkidle")
                
                content = await page.content()
                title = await page.title()
                
                await browser.close()
                
                return {
                    "url": url,
                    "title": title,
                    "content": content[:2000],
                    "full_content_length": len(content),
                    "tool": "playwright"
                }
        except Exception as e:
            print(f"❌ Playwright error: {e}")
            return {"error": str(e)}


class WikidataTool:
    """Wikidata Query Tool"""
    
    def __init__(self):
        self.enabled = True
    
    async def query(self, sparql_query: str) -> Dict:
        """Query Wikidata using SPARQL"""
        try:
            import aiohttp
            
            url = "https://query.wikidata.org/sparql"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url,
                    params={
                        "query": sparql_query,
                        "format": "json"
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "results": data.get("results", {}).get("bindings", []),
                            "tool": "wikidata"
                        }
                    else:
                        return {"error": f"Wikidata error: {response.status}"}
        except Exception as e:
            print(f"❌ Wikidata error: {e}")
            return {"error": str(e)}


class MatplotlibTool:
    """Matplotlib Visualization Tool"""
    
    def __init__(self):
        self.enabled = True
    
    async def create_visualization(self, plot_code: str) -> Dict:
        """Create visualization using Matplotlib"""
        try:
            import matplotlib.pyplot as plt
            import base64
            from io import BytesIO
            
            exec_globals = {"plt": plt, "BytesIO": BytesIO, "base64": base64}
            
            def _create_plot():
                exec(plot_code, exec_globals)
                
                buffer = BytesIO()
                plt.savefig(buffer, format="png")
                buffer.seek(0)
                
                image_base64 = base64.b64encode(buffer.read()).decode()
                plt.close()
                
                return image_base64
            
            image_b64 = await asyncio.get_event_loop().run_in_executor(None, _create_plot)
            
            return {
                "image_base64": image_b64,
                "tool": "matplotlib"
            }
        except Exception as e:
            print(f"❌ Matplotlib error: {e}")
            return {"error": str(e)}


class ShellCommandTool:
    """Shell Command Execution Tool - Execute terminal commands"""
    
    def __init__(self):
        self.enabled = True
        self.allowed_commands = {
            "ls", "grep", "cat", "wc", "echo", "date", "pwd", "which",
            "git", "python", "node", "npm", "pip", "curl", "wget"
        }
    
    async def execute(self, command: str) -> Dict:
        """Execute shell command safely"""
        try:
            import subprocess
            
            # Security: Only allow whitelisted commands
            cmd_base = command.split()[0] if command else ""
            if cmd_base not in self.allowed_commands:
                return {
                    "error": f"Command '{cmd_base}' not allowed. Allowed: {', '.join(self.allowed_commands)}"
                }
            
            def _run_command():
                result = subprocess.run(
                    command,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                return result.stdout, result.stderr, result.returncode
            
            stdout, stderr, returncode = await asyncio.get_event_loop().run_in_executor(None, _run_command)
            
            return {
                "command": command,
                "stdout": stdout[:1000],  # Limit output
                "stderr": stderr[:1000],
                "returncode": returncode,
                "tool": "shell",
                "success": returncode == 0
            }
        except subprocess.TimeoutExpired:
            return {"error": "Command execution timed out (10 second limit)"}
        except Exception as e:
            print(f"❌ Shell command error: {e}")
            return {"error": str(e)}


class BraveSearchTool:
    """Brave Search Tool - Privacy-focused web search"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.BRAVE_SEARCH_API_KEY or os.getenv("BRAVE_SEARCH_API_KEY")
        self.enabled = bool(self.api_key)
    
    async def search(self, query: str, num_results: int = 5) -> Dict:
        """Search using Brave Search"""
        if not self.enabled:
            return {"error": "Brave Search API key not configured"}
        
        try:
            import aiohttp
            
            url = "https://api.search.brave.com/res/v1/web/search"
            headers = {"Accept": "application/json", "X-Subscription-Token": self.api_key}
            
            params = {
                "q": query,
                "count": num_results,
                "result_filter": "web"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        results = []
                        for item in data.get("web", {}).get("results", [])[:num_results]:
                            results.append({
                                "title": item.get("title"),
                                "url": item.get("url"),
                                "description": item.get("description")
                            })
                        
                        return {
                            "query": query,
                            "results": results,
                            "tool": "brave_search"
                        }
                    else:
                        return {"error": f"Brave Search error: {response.status}"}
        except Exception as e:
            print(f"❌ Brave Search error: {e}")
            return {"error": str(e)}


class GoogleScholarTool:
    """Google Scholar Tool - Academic research search"""
    
    def __init__(self):
        self.enabled = True
    
    async def search(self, query: str, max_results: int = 5) -> Dict:
        """Search Google Scholar for academic papers"""
        try:
            from scholarly import scholarly
            
            def _search_scholar():
                search_query = scholarly.search_pubs(query)
                results = []
                for i, pub in enumerate(search_query):
                    if i >= max_results:
                        break
                    results.append({
                        "title": pub.get("bib", {}).get("title", ""),
                        "authors": pub.get("bib", {}).get("author", ""),
                        "year": pub.get("bib", {}).get("pub_year", ""),
                        "abstract": pub.get("bib", {}).get("abstract", ""),
                        "url": pub.get("pub_url", "")
                    })
                return results
            
            results = await asyncio.get_event_loop().run_in_executor(None, _search_scholar)
            
            return {
                "query": query,
                "results": results,
                "tool": "google_scholar",
                "total_results": len(results)
            }
        except ImportError:
            return {"error": "scholarly package not installed"}
        except Exception as e:
            print(f"❌ Google Scholar error: {e}")
            return {"error": str(e)}


class SearchApiTool:
    """SearchApi.com Tool - Universal search API (BEST FOR ACCURACY)"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.SEARCHAPI_API_KEY or os.getenv("SEARCHAPI_API_KEY")
        self.enabled = bool(self.api_key)
    
    async def search(self, query: str, num_results: int = 5) -> Dict:
        """Search using SearchApi.com"""
        if not self.enabled:
            return {"error": "SearchApi API key not configured. Set SEARCHAPI_API_KEY"}
        
        try:
            import aiohttp
            
            url = "https://www.searchapi.io/api/v1/search"
            
            params = {
                "api_key": self.api_key,
                "q": query,
                "num": num_results,
                "engine": "google"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        results = []
                        
                        # Extract organic results
                        for item in data.get("organic_results", [])[:num_results]:
                            results.append({
                                "title": item.get("title"),
                                "link": item.get("link"),
                                "snippet": item.get("snippet"),
                                "position": item.get("position")
                            })
                        
                        return {
                            "query": query,
                            "results": results,
                            "tool": "searchapi",
                            "search_engine": "google",
                            "total_results": len(results)
                        }
                    else:
                        return {"error": f"SearchApi error: {response.status}"}
        except Exception as e:
            print(f"❌ SearchApi error: {e}")
            return {"error": str(e)}


class TavilySearchTool:
    """Tavily Search Tool - AI-optimized search"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.TAVILY_API_KEY or os.getenv("TAVILY_API_KEY")
        self.enabled = bool(self.api_key)
    
    async def search(self, query: str, num_results: int = 5) -> Dict:
        """Search using Tavily API"""
        if not self.enabled:
            return {"error": "Tavily API key not configured. Set TAVILY_API_KEY"}
        
        try:
            import aiohttp
            
            url = "https://api.tavily.com/search"
            
            payload = {
                "api_key": self.api_key,
                "query": query,
                "max_results": num_results,
                "include_answer": True,
                "include_raw_content": False
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        results = []
                        for item in data.get("results", [])[:num_results]:
                            results.append({
                                "title": item.get("title"),
                                "url": item.get("url"),
                                "content": item.get("content"),
                                "score": item.get("score")
                            })
                        
                        return {
                            "query": query,
                            "results": results,
                            "answer": data.get("answer"),
                            "tool": "tavily",
                            "total_results": len(results)
                        }
                    else:
                        return {"error": f"Tavily error: {response.status}"}
        except Exception as e:
            print(f"❌ Tavily Search error: {e}")
            return {"error": str(e)}


class RobocorpToolkit:
    """Robocorp Toolkit - Automation and RPA tools"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.ROBOCORP_API_KEY or os.getenv("ROBOCORP_API_KEY")
        self.enabled = True  # Some functions don't need API key
    
    async def run_automation(self, task_name: str, params: Dict = None) -> Dict:
        """Run a Robocorp automation task"""
        try:
            # Robocorp provides SDK for Python
            # This is a placeholder for integration
            return {
                "error": "Robocorp integration requires RPA Framework installation",
                "install": "pip install rpa",
                "docs": "https://robocorp.com"
            }
        except Exception as e:
            print(f"❌ Robocorp error: {e}")
            return {"error": str(e)}
    
    async def list_automations(self) -> Dict:
        """List available automations"""
        try:
            return {
                "message": "Robocorp automations available via RPA Framework",
                "requires": "robocorp RPA Framework",
                "tool": "robocorp"
            }
        except Exception as e:
            return {"error": str(e)}


class ToolsManager:
    """Main Tools Manager for coordinating all tools"""
    
    def __init__(self):
        self.tools: Dict[str, Any] = {}
        self.enabled_tools: Dict[str, bool] = {}
        self._initialize_tools()
    
    def _initialize_tools(self):
        """Initialize all available tools"""
        print("🛠️ Initializing Tools Manager...")
        
        # PRIMARY Search Tools (DEFAULT - Always Available)
        # SearchApi is PRIMARY/FIRST choice for best results
        self.tools["searchapi"] = SearchApiTool()
        self.tools["google_serper"] = GoogleSerperTool()
        self.tools["tavily_search"] = TavilySearchTool()
        self.tools["duckduckgo"] = DuckDuckGoSearchTool()
        self.tools["brave_search"] = BraveSearchTool()
        self.tools["wikipedia"] = WikipediaTool()
        self.tools["google_scholar"] = GoogleScholarTool()
        self.tools["arxiv"] = ArxivTool()
        self.tools["youtube"] = YoutubeSearchTool()
        
        # Browser Tool (DEFAULT for web browsing)
        self.tools["playwright"] = PlaywrightBrowserTool()
        
        # Automation (Conditional)
        self.tools["robocorp"] = RobocorpToolkit()
        
        # Weather Tool
        self.tools["weather"] = WeatherTool()
        
        # Code Execution (Conditional)
        self.tools["code_interpreter"] = CodeInterpreterTool()
        
        # Shell Command (Conditional)
        self.tools["shell"] = ShellCommandTool()
        
        # Git/GitHub (Conditional)
        self.tools["github"] = GithubToolkit()
        
        # Data Analysis (Conditional)
        self.tools["wikidata"] = WikidataTool()
        self.tools["matplotlib"] = MatplotlibTool()
        
        # Update enabled status
        for tool_name, tool_instance in self.tools.items():
            self.enabled_tools[tool_name] = getattr(tool_instance, "enabled", True)
            status = "✅" if self.enabled_tools[tool_name] else "⚠️"
            tool_type = "PRIMARY" if tool_name == "searchapi" else ""
            print(f"   {status} {tool_name.replace('_', ' ').title()} {tool_type}")
    
    async def use_tool(self, tool_name: str, **kwargs) -> Dict:
        """Use a specific tool"""
        if tool_name not in self.tools:
            return {"error": f"Tool '{tool_name}' not found"}
        
        if not self.enabled_tools.get(tool_name, False):
            return {"error": f"Tool '{tool_name}' is not enabled. Check API keys."}
        
        try:
            tool = self.tools[tool_name]
            
            print(f"🔧 Using tool: {tool_name} with params: {list(kwargs.keys())}")
            
            # Call appropriate method based on tool
            if tool_name == "searchapi":
                result = await tool.search(kwargs.get("query", ""), kwargs.get("num_results", 5))
            elif tool_name == "google_serper":
                result = await tool.search(kwargs.get("query", ""), kwargs.get("num_results", 5))
            elif tool_name == "tavily_search":
                result = await tool.search(kwargs.get("query", ""), kwargs.get("num_results", 5))
            elif tool_name == "duckduckgo":
                result = await tool.search(kwargs.get("query", ""), kwargs.get("num_results", 5))
            elif tool_name == "brave_search":
                result = await tool.search(kwargs.get("query", ""), kwargs.get("num_results", 5))
            elif tool_name == "wikipedia":
                result = await tool.search(kwargs.get("query", ""))
            elif tool_name == "google_scholar":
                result = await tool.search(kwargs.get("query", ""), kwargs.get("max_results", 5))
            elif tool_name == "arxiv":
                result = await tool.search(kwargs.get("query", ""), kwargs.get("max_results", 5))
            elif tool_name == "youtube":
                result = await tool.search(kwargs.get("query", ""), kwargs.get("max_results", 5))
            elif tool_name == "weather":
                result = await tool.get_weather(kwargs.get("city", ""))
            elif tool_name == "code_interpreter":
                result = await tool.execute_code(kwargs.get("code", ""), kwargs.get("language", "python"))
            elif tool_name == "shell":
                result = await tool.execute(kwargs.get("command", ""))
            elif tool_name == "github":
                result = await tool.search_repos(kwargs.get("query", ""), kwargs.get("max_results", 5))
            elif tool_name == "playwright":
                result = await tool.fetch_page(kwargs.get("url", ""))
            elif tool_name == "robocorp":
                result = await tool.run_automation(kwargs.get("task_name", ""), kwargs.get("params", {}))
            elif tool_name == "wikidata":
                result = await tool.query(kwargs.get("sparql_query", ""))
            elif tool_name == "matplotlib":
                result = await tool.create_visualization(kwargs.get("plot_code", ""))
            else:
                result = {"error": f"Tool '{tool_name}' method not implemented"}
            
            return result
        
        except Exception as e:
            print(f"❌ Error using tool '{tool_name}': {e}")
            traceback.print_exc()
            return {"error": str(e), "tool": tool_name}
    
    def get_tool_list(self) -> Dict:
        """Get list of all available tools with their status"""
        return {
            "total_tools": len(self.tools),
            "enabled_tools": sum(1 for v in self.enabled_tools.values() if v),
            "disabled_tools": sum(1 for v in self.enabled_tools.values() if not v),
            "tools": {
                name: {
                    "enabled": self.enabled_tools.get(name, False),
                    "category": self._get_tool_category(name)
                }
                for name in self.tools.keys()
            }
        }
    
    def _get_tool_category(self, tool_name: str) -> str:
        """Get category of a tool"""
        # PRIMARY Search tool (best accuracy)
        if tool_name == "searchapi":
            return "search_primary"
        # Search tools (DEFAULT - always available)
        search_tools = ["google_serper", "tavily_search", "duckduckgo", "brave_search", "wikipedia", "google_scholar", "arxiv", "youtube"]
        if tool_name in search_tools:
            return "search"
        # Browser (DEFAULT for web browsing)
        elif tool_name == "playwright":
            return "browser"
        # Automation (Conditional)
        elif tool_name == "robocorp":
            return "automation"
        # Conditionally available
        elif tool_name == "weather":
            return "weather"
        elif tool_name == "code_interpreter":
            return "code_execution"
        elif tool_name == "shell":
            return "shell"
        elif tool_name == "github":
            return "git"
        elif tool_name in ["wikidata", "matplotlib"]:
            return "data"
        return "other"


# Global instance
tools_manager = ToolsManager()
