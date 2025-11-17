"""
Test script to verify all langchain tools are working correctly
Run this from the fastapi_app directory: python test_tools.py
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config import settings
from services.tools_manager import tools_manager


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)


def test_env_loading():
    """Test if environment variables are loaded correctly"""
    print_section("1. ENVIRONMENT VARIABLES LOADING TEST")
    
    api_keys = {
        "HF_TOKEN": settings.HF_TOKEN,
        "GOOGLE_SERPER_API_KEY": settings.GOOGLE_SERPER_API_KEY,
        "YOUTUBE_API_KEY": settings.YOUTUBE_API_KEY,
        "GITHUB_TOKEN": settings.GITHUB_TOKEN,
        "SEARCHAPI_API_KEY": settings.SEARCHAPI_API_KEY,
        "TAVILY_API_KEY": settings.TAVILY_API_KEY,
        "BRAVE_SEARCH_API_KEY": settings.BRAVE_SEARCH_API_KEY,
        "OPENWEATHERMAP_API_KEY": settings.OPENWEATHERMAP_API_KEY,
        "RIZA_API_KEY": settings.RIZA_API_KEY,
    }
    
    print("\nLoaded Environment Variables:")
    for key, value in api_keys.items():
        if value:
            # Show first 10 and last 5 chars for security
            masked = f"{value[:10]}...{value[-5:]}" if len(value) > 15 else "***"
            print(f"  ✅ {key}: {masked}")
        else:
            print(f"  ❌ {key}: NOT SET")
    
    return api_keys


def test_tool_initialization():
    """Test if tools are initialized correctly"""
    print_section("2. TOOL INITIALIZATION TEST")
    
    print(f"\nTotal tools registered: {len(tools_manager.tools)}")
    print("\nTool Status:")
    
    status_summary = {
        "enabled": [],
        "disabled": [],
    }
    
    for tool_name in sorted(tools_manager.tools.keys()):
        enabled = tools_manager.enabled_tools.get(tool_name, False)
        status = "✅" if enabled else "⚠️"
        
        if enabled:
            status_summary["enabled"].append(tool_name)
        else:
            status_summary["disabled"].append(tool_name)
        
        print(f"  {status} {tool_name.replace('_', ' ').title()}")
    
    print(f"\n📊 Summary:")
    print(f"  ✅ Enabled: {len(status_summary['enabled'])}")
    print(f"  ⚠️  Disabled: {len(status_summary['disabled'])}")
    
    if status_summary["disabled"]:
        print(f"\nDisabled tools (need API keys):")
        for tool in status_summary["disabled"]:
            print(f"  - {tool.replace('_', ' ').title()}")
    
    return status_summary


async def test_individual_tools():
    """Test individual tool functionality"""
    print_section("3. INDIVIDUAL TOOL TESTS")
    
    # Test DuckDuckGo (should always work)
    print("\n🦆 Testing DuckDuckGo Search...")
    try:
        result = await tools_manager.use_tool("duckduckgo", query="machine learning", num_results=2)
        if "results" in result and result["results"]:
            print(f"  ✅ DuckDuckGo working! Found {len(result['results'])} results")
        elif "error" not in result:
            print(f"  ⚠️  DuckDuckGo no results")
        else:
            print(f"  ❌ DuckDuckGo error: {result.get('error')}")
    except Exception as e:
        print(f"  ❌ DuckDuckGo exception: {e}")
    
    # Test Wikipedia (should always work)
    print("\n📖 Testing Wikipedia...")
    try:
        result = await tools_manager.use_tool("wikipedia", query="Artificial Intelligence")
        if "results" in result and result["results"]:
            print(f"  ✅ Wikipedia working! Found {len(result['results'])} results")
        elif "error" not in result:
            print(f"  ⚠️  Wikipedia no results")
        else:
            print(f"  ❌ Wikipedia error: {result.get('error')}")
    except Exception as e:
        print(f"  ❌ Wikipedia exception: {e}")
    
    # Test SearchAPI (requires API key)
    print("\n🔍 Testing SearchAPI...")
    try:
        result = await tools_manager.use_tool("searchapi", query="python programming", num_results=2)
        if "error" in result:
            if "not configured" in result["error"].lower():
                print(f"  ⚠️  SearchAPI: {result['error']}")
            else:
                print(f"  ❌ SearchAPI error: {result['error']}")
        elif "results" in result and result["results"]:
            print(f"  ✅ SearchAPI working! Found {len(result['results'])} results")
        else:
            print(f"  ⚠️  SearchAPI no results")
    except Exception as e:
        print(f"  ❌ SearchAPI exception: {e}")
    
    # Test YouTube (requires API key)
    print("\n🎥 Testing YouTube...")
    try:
        result = await tools_manager.use_tool("youtube", query="machine learning tutorial", max_results=2)
        if "error" in result:
            if "not configured" in result["error"].lower():
                print(f"  ⚠️  YouTube: {result['error']}")
            else:
                print(f"  ❌ YouTube error: {result['error']}")
        elif "results" in result and result["results"]:
            print(f"  ✅ YouTube working! Found {len(result['results'])} results")
        else:
            print(f"  ⚠️  YouTube no results")
    except Exception as e:
        print(f"  ❌ YouTube exception: {e}")
    
    # Test GitHub (requires token)
    print("\n🐙 Testing GitHub...")
    try:
        result = await tools_manager.use_tool("github", query="langchain", max_results=2)
        if "error" in result:
            if "not configured" in result["error"].lower():
                print(f"  ⚠️  GitHub: {result['error']}")
            else:
                print(f"  ❌ GitHub error: {result['error']}")
        elif "results" in result and result["results"]:
            print(f"  ✅ GitHub working! Found {len(result['results'])} results")
        else:
            print(f"  ⚠️  GitHub no results")
    except Exception as e:
        print(f"  ❌ GitHub exception: {e}")
    
    # Test Tavily (requires API key)
    print("\n⚡ Testing Tavily Search...")
    try:
        result = await tools_manager.use_tool("tavily_search", query="artificial intelligence 2024", num_results=2)
        if "error" in result:
            if "not configured" in result["error"].lower():
                print(f"  ⚠️  Tavily: {result['error']}")
            else:
                print(f"  ❌ Tavily error: {result['error']}")
        elif "results" in result and result["results"]:
            print(f"  ✅ Tavily working! Found {len(result['results'])} results")
        else:
            print(f"  ⚠️  Tavily no results")
    except Exception as e:
        print(f"  ❌ Tavily exception: {e}")


def print_recommendations():
    """Print recommendations for fixing issues"""
    print_section("4. RECOMMENDATIONS")
    
    print("""
If you see warnings (⚠️) or errors (❌), here's how to fix them:

1. **YouTube Not Working:**
   - Ensure YOUTUBE_API_KEY is set in .env (currently at ~/github/eduwingz/backend/.env)
   - Get key from: https://console.cloud.google.com/
   - Set in .env: YOUTUBE_API_KEY=your_key_here (no quotes)

2. **SearchAPI Not Working:**
   - Ensure SEARCHAPI_API_KEY is set in .env
   - Get key from: https://www.searchapi.io/
   - Set in .env: SEARCHAPI_API_KEY=your_key_here (no quotes)

3. **GitHub Not Working:**
   - Ensure GITHUB_TOKEN is set in .env
   - Generate token from: https://github.com/settings/tokens
   - Set in .env: GITHUB_TOKEN=ghp_xxxxx (no quotes)

4. **Tavily Not Working:**
   - Ensure TAVILY_API_KEY is set in .env
   - Get key from: https://tavily.com/
   - Set in .env: TAVILY_API_KEY=tvly-xxxxx (no quotes)

5. **Brave Search Not Working:**
   - Ensure BRAVE_SEARCH_API_KEY is set in .env
   - Get key from: https://api.search.brave.com/
   - Set in .env: BRAVE_SEARCH_API_KEY=your_key_here (no quotes)

⚠️  IMPORTANT NOTES:
   - Do NOT use quotes in .env file values (key=value, not key="value")
   - Restart the FastAPI server after changing .env
   - API keys should be first 10 chars...last 5 chars (never full key)
   - DuckDuckGo and Wikipedia always work (no API key needed)

✅ To restart FastAPI:
   1. Stop the current server (CTRL+C in terminal)
   2. Run: uvicorn main:app --reload --port 8000
   """)


async def main():
    """Main test function"""
    print("\n" + "🧪 LANGCHAIN TOOLS DIAGNOSTIC TEST" + "\n")
    
    # Test 1: Environment variables
    api_keys = test_env_loading()
    
    # Test 2: Tool initialization
    status_summary = test_tool_initialization()
    
    # Test 3: Individual tool tests
    await test_individual_tools()
    
    # Test 4: Recommendations
    print_recommendations()
    
    print("\n" + "="*60)
    print("  ✅ TEST COMPLETE")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
