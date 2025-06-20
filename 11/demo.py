#!/usr/bin/env python3
"""
Demo script for Speech-to-Text Application
Tests the application with the provided sample audio file
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

def check_requirements():
    """Check if all requirements are met"""
    # Check if .env file exists
    if not Path(".env").exists():
        print("❌ .env file not found")
        print("Please run: cp env_example.txt .env")
        print("Then edit .env and add your OpenAI API key")
        return False
    
    # Load environment variables
    load_dotenv()
    
    # Check if API key is set
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key or api_key == 'your_openai_api_key_here':
        print("❌ OpenAI API key not configured")
        print("Please edit your .env file and add your actual API key")
        return False
    
    # Check if audio file exists
    if not Path("CAR0004.mp3").exists():
        print("❌ Sample audio file CAR0004.mp3 not found")
        return False
    
    print("✅ All requirements met!")
    return True

def run_demo():
    """Run the demo with the sample audio file"""
    print("🎵 Running demo with CAR0004.mp3...")
    print("This will:")
    print("  1. Transcribe the audio using Whisper API")
    print("  2. Generate a summary using GPT-4")
    print("  3. Extract analytics and topics")
    print("  4. Save all results to the transcriptions/ folder")
    print("\nPress Enter to continue or Ctrl+C to cancel...")
    
    try:
        input()
    except KeyboardInterrupt:
        print("\n❌ Demo cancelled")
        return
    
    # Import and run the main application
    try:
        from main import SpeechAnalyzer, display_results
        
        analyzer = SpeechAnalyzer()
        results = analyzer.process_audio("CAR0004.mp3")
        display_results(results)
        
        print("\n🎉 Demo completed successfully!")
        print("Check the transcriptions/ folder for the generated files.")
        
    except Exception as e:
        print(f"❌ Error during demo: {e}")
        print("Please check your internet connection and API key.")

def main():
    print("🚀 Speech-to-Text Application Demo")
    print("=" * 40)
    
    if not check_requirements():
        print("\n⚠️  Please fix the issues above and try again.")
        return
    
    run_demo()

if __name__ == "__main__":
    main() 