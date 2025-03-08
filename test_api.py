#!/usr/bin/env python3
"""
Test script for kritak CTF API
Usage: ./test_api.py "Your message to the AI" --level 1
"""

import argparse
import requests
import json
import os
from pathlib import Path

def read_api_key():
    """Read API key from file"""
    api_key_file = Path('/home/ubuntu/kritak-ctf/.api_key')
    if api_key_file.exists():
        with open(api_key_file, 'r') as f:
            return f.read().strip()
    else:
        print("API key file not found. Please run the server first.")
        return None

def send_message(message, level=1):
    """Send message to API and return response"""
    api_key = read_api_key()
    if not api_key:
        return
    
    url = "http://localhost:5000/api/direct"
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }
    data = {
        "message": message,
        "level": level
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Test the kritak CTF API")
    parser.add_argument("message", help="Message to send to the AI")
    parser.add_argument("--level", type=int, default=1, help="Level to test (1-3)")
    
    args = parser.parse_args()
    
    result = send_message(args.message, args.level)
    if result:
        print("\n--- RESPONSE ---")
        print(result["response"])
        print("\n--- RESULTS ---")
        if result["flag_found"]:
            print(f"🎉 FLAG FOUND: {result['flag']}")
        else:
            print("❌ No flag found. Try a different approach.")

if __name__ == "__main__":
    main()
