#!/usr/bin/env python3
"""
Test script for Ollama streaming in Kritak CTF
This tests the streaming API endpoint with Ollama
"""

import requests
import json
import os
import sys
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Ollama configuration
OLLAMA_HOST = os.environ.get('OLLAMA_HOST', 'http://localhost:11434')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'gemma3:1b')
FLASK_HOST = 'http://localhost:5000'

def test_direct_ollama_streaming():
    """Test streaming directly from Ollama"""
    print("Testing direct Ollama streaming...")
    
    request_data = {
        "model": OLLAMA_MODEL,
        "prompt": "What is the capital of France?",
        "stream": True
    }
    
    try:
        full_response = ""
        with requests.post(
            f"{OLLAMA_HOST}/api/generate",
            headers={'Content-Type': 'application/json'},
            json=request_data,
            stream=True
        ) as resp:
            print("\nStreaming response from Ollama:\n")
            print("-" * 50)
            
            for line in resp.iter_lines():
                if line:
                    try:
                        chunk_data = json.loads(line.decode('utf-8'))
                        if 'response' in chunk_data:
                            chunk = chunk_data['response']
                            full_response += chunk
                            print(chunk, end='', flush=True)
                        if chunk_data.get('done', False):
                            print("\n\nStreaming complete!")
                            break
                    except json.JSONDecodeError:
                        print(f"Warning: Could not parse line: {line.decode('utf-8')}")
        
        print("\n" + "-" * 50)
        print(f"\nFull response: {full_response}")
        return True
    except Exception as e:
        print(f"Error testing Ollama streaming: {str(e)}")
        return False

def test_kritak_api():
    """Test Kritak's API endpoints"""
    # Test standard API endpoint
    print("\nTesting standard API endpoint...")
    try:
        response = requests.post(
            f"{FLASK_HOST}/api/chat",
            json={"message": "Hello, what are you?"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"API response: {data['response'][:100]}...")
            print(f"Current level: {data['level']}")
            print("Standard API endpoint working!")
        else:
            print(f"Error: Status {response.status_code}")
            return False
            
        # Test streaming API simulation
        print("\nTesting streaming API endpoint simulation...")
        print("(This will use curl in a separate process for proper streaming)")
        
        message = "Tell me about yourself"
        os.system(f'curl -N "{FLASK_HOST}/api/chat/stream?message={message}"')
        
        return True
    except Exception as e:
        print(f"Error testing Kritak API: {str(e)}")
        return False

if __name__ == "__main__":
    print("Kritak CTF - Streaming Test")
    print("-" * 50)
    print(f"Ollama Host: {OLLAMA_HOST}")
    print(f"Ollama Model: {OLLAMA_MODEL}")
    print(f"Flask App: {FLASK_HOST}")
    print("-" * 50)
    
    # Verify Ollama is running
    try:
        response = requests.get(f"{OLLAMA_HOST}/api/tags")
        if response.status_code != 200:
            print(f"Error: Ollama not running or not responding at {OLLAMA_HOST}")
            sys.exit(1)
        
        models = [model.get('name') for model in response.json().get('models', [])]
        if OLLAMA_MODEL not in models:
            print(f"Warning: Model {OLLAMA_MODEL} not found in Ollama. Available models: {', '.join(models)}")
            print(f"If you meant to use a different model, update your .env file or specify OLLAMA_MODEL environment variable.")
            
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to Ollama at {OLLAMA_HOST}")
        print("Make sure Ollama is running.")
        sys.exit(1)
    
    # Verify Flask app is running
    try:
        response = requests.get(FLASK_HOST)
        if response.status_code not in [200, 302]:
            print(f"Error: Flask app not running or not responding at {FLASK_HOST}")
            sys.exit(1)
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to Flask app at {FLASK_HOST}")
        print("Make sure the app is running with 'python app.py'")
        sys.exit(1)
    
    # Run tests
    print("\nRunning tests...\n")
    
    if test_direct_ollama_streaming():
        print("\n✓ Direct Ollama streaming test passed!")
    else:
        print("\n❌ Direct Ollama streaming test failed!")
    
    if test_kritak_api():
        print("\n✓ Kritak API test passed!")
    else:
        print("\n❌ Kritak API test failed!") 