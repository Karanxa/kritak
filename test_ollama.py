#!/usr/bin/env python3
"""
Test script for kritak with Ollama API
This script tests connection to Ollama and basic functionality
"""

import requests
import os
import sys
import json
import argparse
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_args():
    parser = argparse.ArgumentParser(description='Test Ollama connection and models for kritak CTF')
    parser.add_argument('--list', action='store_true', help='List available models and exit')
    parser.add_argument('--use', metavar='MODEL', help='Test with a specific model')
    parser.add_argument('--details', action='store_true', help='Show detailed model information')
    parser.add_argument('--host', help='Ollama host URL (defaults to OLLAMA_HOST env var or http://localhost:11434)')
    return parser.parse_args()

# Get Ollama configuration
args = get_args()
ollama_host = args.host or os.environ.get("OLLAMA_HOST", "http://localhost:11434")
ollama_model = args.use or os.environ.get("OLLAMA_MODEL", "llama3")

def get_available_models(show_details=False):
    """Get list of available models from Ollama"""
    try:
        print(f"Connecting to Ollama at {ollama_host}...")
        response = requests.get(f"{ollama_host}/api/tags")
        
        if response.status_code != 200:
            print(f"❌ Error connecting to Ollama: Status {response.status_code}")
            return None
        
        data = response.json()
        models = data.get("models", [])
        
        if not models:
            print("No models found in Ollama.")
            return []
        
        print(f"✓ Found {len(models)} available models")
        
        if show_details:
            model_details = []
            for model in models:
                model_name = model.get('name')
                # Get model details
                try:
                    details_resp = requests.post(
                        f"{ollama_host}/api/show",
                        json={"name": model_name}
                    )
                    
                    if details_resp.status_code == 200:
                        details = details_resp.json()
                        model_info = {
                            "name": model_name,
                            "modelfile": details.get("modelfile", "N/A"),
                            "parameters": details.get("parameters", "N/A"),
                            "size": model.get("size", 0) / (1024*1024*1024), # Convert to GB
                            "modified_at": model.get("modified_at", "N/A"),
                        }
                        model_details.append(model_info)
                    else:
                        model_details.append({"name": model_name, "error": "Could not fetch details"})
                except Exception as e:
                    model_details.append({"name": model_name, "error": str(e)})
            
            return model_details
        else:
            return [model.get('name') for model in models]
        
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error: Could not connect to Ollama at {ollama_host}")
        print("Is Ollama running? Check with 'ps aux | grep ollama'")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_ollama_connection(model_name):
    """Test basic connection to Ollama API with the specified model"""
    try:
        # Check if specified model is available
        available_models = get_available_models()
        
        if available_models is None:
            return False
        
        if not available_models:
            print(f"❌ No models found. Please run: ollama pull {model_name}")
            return False
        
        if model_name not in available_models:
            print(f"❌ Model '{model_name}' not found. Available models:")
            for model in available_models:
                print(f"  - {model}")
            print(f"\nTry running: ollama pull {model_name}")
            return False
        
        print(f"✓ Model '{model_name}' is available")
        
        # Test a simple generation
        print(f"Testing generation with model {model_name}...")
        response = requests.post(
            f"{ollama_host}/api/generate",
            json={
                "model": model_name,
                "prompt": "Say hello to kritak CTF",
                "stream": False
            }
        )
        
        if response.status_code != 200:
            print(f"❌ Error generating text: Status {response.status_code}")
            return False
        
        result = response.json()
        if "response" in result:
            print(f"✓ Successfully generated text with {model_name}")
            print("\nSample output:")
            print("-" * 50)
            print(result["response"])
            print("-" * 50)
            
            # Additional model information
            if "eval_count" in result and "eval_duration" in result:
                tokens = result.get("eval_count", 0)
                duration = result.get("eval_duration", 0) / 1000000000  # Convert ns to seconds
                if tokens > 0 and duration > 0:
                    tokens_per_second = tokens / duration
                    print(f"Performance metrics:")
                    print(f"- Generated {tokens} tokens in {duration:.2f} seconds")
                    print(f"- Speed: {tokens_per_second:.2f} tokens/second")
            
            return True
        else:
            print(f"❌ Error in generation response: {result}")
            return False
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def display_model_details(models):
    """Display detailed information about available models"""
    print("\nAvailable Models:")
    print("-" * 80)
    print(f"{'MODEL NAME':<20} {'SIZE (GB)':<10} {'PARAMETERS':<15} {'MODIFIED':<25}")
    print("-" * 80)
    
    for model in models:
        name = model.get('name', 'Unknown')
        size = f"{model.get('size', 0):.2f}" if isinstance(model.get('size'), (int, float)) else "N/A"
        params = model.get('parameters', 'N/A')
        modified = model.get('modified_at', 'N/A')
        
        print(f"{name:<20} {size:<10} {params:<15} {modified:<25}")
    
    print("-" * 80)
    print(f"\nTotal models: {len(models)}")

if __name__ == "__main__":
    print("Kritak CTF - Ollama Connection Test")
    print("-" * 50)
    print(f"Ollama Host: {ollama_host}")
    
    # If --list flag is provided, just list models and exit
    if args.list:
        models = get_available_models(args.details)
        if models:
            if args.details:
                display_model_details(models)
            else:
                print("\nAvailable models:")
                for model in models:
                    print(f"- {model}")
        sys.exit(0 if models else 1)
    
    print(f"Testing model: {ollama_model}")
    print("-" * 50)
    
    if test_ollama_connection(ollama_model):
        print("\n✓ All tests passed! Kritak CTF should work with Ollama.")
        print(f"\nTo run the CTF with model '{ollama_model}':")
        print(f"1. Make sure OLLAMA_MODEL={ollama_model} is in your .env file")
        print(f"2. Run 'python app.py' to start the CTF")
        print(f"3. Visit http://localhost:5000 in your browser")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
        sys.exit(1) 