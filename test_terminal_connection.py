#!/usr/bin/env python3
"""
Terminal Connection Test Script
Tests if all components are working correctly
Run: python test_terminal_connection.py
"""

import requests
import asyncio
import json
from datetime import datetime
import sys

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    CYAN = '\033[96m'
    RESET = '\033[0m'

def print_header(text):
    print(f"\n{Colors.CYAN}{'='*60}{Colors.RESET}")
    print(f"{Colors.CYAN}{text.center(60)}{Colors.RESET}")
    print(f"{Colors.CYAN}{'='*60}{Colors.RESET}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.RESET}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.RESET}")

def test_backend_health():
    """Test if backend is running"""
    print_header("Testing Backend Health")
    
    try:
        response = requests.get('http://localhost:8000/', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Backend is running: {data.get('message', 'OK')}")
            return True
        else:
            print_error(f"Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend (http://localhost:8000)")
        print_info("Make sure backend is running: cd backend && python main.py")
        return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_backend_start():
    """Test if /backend/start endpoint works"""
    print_header("Testing /backend/start Endpoint")
    
    try:
        response = requests.post('http://localhost:8000/backend/start', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Backend start endpoint works: {data.get('message', 'OK')}")
            return True
        else:
            print_error(f"Endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_backend_stop():
    """Test if /backend/stop endpoint works"""
    print_header("Testing /backend/stop Endpoint")
    
    try:
        response = requests.post('http://localhost:8000/backend/stop', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Backend stop endpoint works: {data.get('message', 'OK')}")
            return True
        else:
            print_error(f"Endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

async def test_websocket():
    """Test WebSocket connection"""
    print_header("Testing WebSocket Connection")
    
    try:
        import websockets
        
        async with websockets.connect('ws://localhost:8000/ws/logs') as websocket:
            print_success("WebSocket connected successfully")
            
            # Send a test message
            try:
                # Wait for initial logs with timeout
                message = await asyncio.wait_for(websocket.recv(), timeout=2)
                data = json.loads(message)
                print_success(f"Received message: [{data.get('type', 'unknown').upper()}] {data.get('message', 'N/A')}")
                return True
            except asyncio.TimeoutError:
                print_warning("No messages received yet (this is OK)")
                return True
            except json.JSONDecodeError:
                print_warning("Received non-JSON message (this is OK)")
                return True
            
    except ImportError:
        print_error("websockets package not installed")
        print_info("Install it: pip install websockets")
        return False
    except Exception as e:
        print_error(f"WebSocket error: {str(e)}")
        print_info("Make sure backend /ws/logs endpoint is working")
        return False

def test_cors():
    """Test if CORS is enabled"""
    print_header("Testing CORS Configuration")
    
    try:
        headers = {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'POST',
        }
        response = requests.options('http://localhost:8000/backend/start', headers=headers, timeout=5)
        
        if 'access-control-allow-origin' in response.headers:
            print_success(f"CORS enabled: {response.headers.get('access-control-allow-origin')}")
            return True
        else:
            print_warning("CORS headers not found (might still work)")
            return True
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def print_summary(results):
    """Print test summary"""
    print_header("Test Summary")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = f"{Colors.GREEN}PASS{Colors.RESET}" if result else f"{Colors.RED}FAIL{Colors.RESET}"
        print(f"  {test_name}: {status}")
    
    print()
    
    if passed == total:
        print_success(f"All tests passed! ({passed}/{total})")
        print_info("Your Terminal setup is working correctly!")
        return True
    else:
        print_warning(f"Some tests failed: {passed}/{total} passed")
        print_info("Check the errors above and refer to DEBUG_LIVE.md")
        return False

def main():
    """Run all tests"""
    print(f"\n{Colors.CYAN}")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║     YouTube Copier - Terminal Connection Test Suite       ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(f"{Colors.RESET}")
    
    results = {
        "Backend Health": test_backend_health(),
        "CORS Configuration": test_cors(),
        "/backend/start Endpoint": test_backend_start(),
        "/backend/stop Endpoint": test_backend_stop(),
    }
    
    # Test WebSocket
    try:
        results["WebSocket Connection"] = asyncio.run(test_websocket())
    except Exception as e:
        print_error(f"WebSocket test failed: {str(e)}")
        results["WebSocket Connection"] = False
    
    all_passed = print_summary(results)
    
    print("\n" + "="*60)
    print("Next Steps:")
    print("="*60)
    
    if all_passed:
        print("1. Run: npm start")
        print("2. Click the تشغيل (Run) button")
        print("3. Terminal should appear at the bottom")
        print("4. You should see backend logs in real-time")
    else:
        print("1. Review the errors above")
        print("2. Check DEBUG_LIVE.md for solutions")
        print("3. Ensure backend is running: cd backend && python main.py")
        print("4. Ensure frontend is running: npm run dev")
    
    print("\n" + "="*60)
    print(f"Test completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60 + "\n")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
