#!/usr/bin/env python3
"""
Setup script for Speech-to-Text Application
Helps users verify their environment and dependencies
"""

import subprocess
import sys
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.7+"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("❌ Python 3.7+ is required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
    return True

def install_dependencies():
    """Install required dependencies"""
    print("\n📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False

def check_env_file():
    """Check if .env file exists and has API key"""
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found")
        print("   Please copy env_example.txt to .env and add your OpenAI API key")
        return False
    
    with open(env_file, 'r') as f:
        content = f.read()
        if "your_openai_api_key_here" in content or not content.strip():
            print("❌ .env file exists but API key is not set")
            print("   Please add your actual OpenAI API key to the .env file")
            return False
    
    print("✅ .env file configured")
    return True

def create_transcriptions_dir():
    """Create transcriptions directory"""
    Path("transcriptions").mkdir(exist_ok=True)
    print("✅ Transcriptions directory ready")

def main():
    print("🚀 Speech-to-Text Application Setup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Create directories
    create_transcriptions_dir()
    
    # Check environment file
    env_ok = check_env_file()
    
    print("\n" + "=" * 40)
    if env_ok:
        print("🎉 Setup complete! You're ready to use the application.")
        print("\nUsage: python main.py your_audio_file.wav")
    else:
        print("⚠️  Setup incomplete. Please configure your .env file.")
        print("   1. Copy env_example.txt to .env")
        print("   2. Add your OpenAI API key")
        print("   3. Run this setup script again")

if __name__ == "__main__":
    main() 