#!/usr/bin/env python3
"""
Speech-to-Text Application with Summarization and Analytics
Uses OpenAI Whisper API for transcription and GPT for analysis
"""

import os
import json
import argparse
import datetime
from pathlib import Path
from typing import Dict, List, Any
import openai
from dotenv import load_dotenv
import re

class SpeechAnalyzer:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Set up OpenAI client
        self.client = openai.OpenAI(
            api_key=os.getenv('OPENAI_API_KEY')
        )
        
        if not os.getenv('OPENAI_API_KEY'):
            raise ValueError("OPENAI_API_KEY not found. Please set it in your .env file.")
        
        # Create directories for outputs
        self.transcriptions_dir = Path("transcriptions")
        self.transcriptions_dir.mkdir(exist_ok=True)
    
    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribe audio file using OpenAI Whisper API
        """
        print(f"🎵 Transcribing audio file: {audio_file_path}")
        
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            
            print("✅ Transcription completed successfully!")
            return transcript
            
        except Exception as e:
            print(f"❌ Error during transcription: {str(e)}")
            raise
    
    def save_transcription(self, transcript: str, original_filename: str) -> str:
        """
        Save transcription to a timestamped file
        """
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = Path(original_filename).stem
        transcript_filename = f"transcription_{base_name}_{timestamp}.md"
        transcript_path = self.transcriptions_dir / transcript_filename
        
        with open(transcript_path, 'w', encoding='utf-8') as f:
            f.write(f"# Transcription for {original_filename}\n\n")
            f.write(f"**Generated:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("## Transcript\n\n")
            f.write(transcript)
        
        print(f"💾 Transcription saved to: {transcript_path}")
        return str(transcript_path)
    
    def generate_summary(self, transcript: str) -> str:
        """
        Generate summary using GPT
        """
        print("📝 Generating summary...")
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional summarizer. Create a concise, well-structured summary that captures the key points, main ideas, and important details from the given transcript. Focus on preserving the core intent and main takeaways."
                    },
                    {
                        "role": "user",
                        "content": f"Please summarize the following transcript:\n\n{transcript}"
                    }
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            summary = response.choices[0].message.content
            print("✅ Summary generated successfully!")
            return summary
            
        except Exception as e:
            print(f"❌ Error during summary generation: {str(e)}")
            raise
    
    def extract_analytics(self, transcript: str) -> Dict[str, Any]:
        """
        Extract analytics from transcript using GPT
        """
        print("📊 Extracting analytics...")
        
        try:
            # First, get basic word count
            words = transcript.split()
            word_count = len(words)
            
            # Use GPT to extract topics and calculate speaking speed
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an analytics expert. Analyze the provided transcript and return a JSON object with the following structure:
{
  "estimated_duration_minutes": <estimate how long this speech likely took in minutes>,
  "frequently_mentioned_topics": [
    {"topic": "Topic Name", "mentions": count},
    {"topic": "Another Topic", "mentions": count}
  ]
}

For topics, identify the main themes, subjects, or concepts discussed. Count how often each is mentioned (including synonyms and related terms). Return at least 3 topics, ordered by frequency."""
                    },
                    {
                        "role": "user", 
                        "content": f"Analyze this transcript:\n\n{transcript}"
                    }
                ],
                max_tokens=800,
                temperature=0.1
            )
            
            # Parse the GPT response
            gpt_analysis = json.loads(response.choices[0].message.content)
            
            # Calculate speaking speed
            estimated_duration = gpt_analysis.get("estimated_duration_minutes", 1)
            speaking_speed_wpm = round(word_count / estimated_duration) if estimated_duration > 0 else 0
            
            analytics = {
                "word_count": word_count,
                "speaking_speed_wpm": speaking_speed_wpm,
                "frequently_mentioned_topics": gpt_analysis.get("frequently_mentioned_topics", [])
            }
            
            print("✅ Analytics extracted successfully!")
            return analytics
            
        except Exception as e:
            print(f"❌ Error during analytics extraction: {str(e)}")
            # Fallback analytics
            words = transcript.split()
            return {
                "word_count": len(words),
                "speaking_speed_wpm": "Unable to calculate",
                "frequently_mentioned_topics": [{"topic": "Analysis failed", "mentions": 0}]
            }
    
    def save_summary(self, summary: str, original_filename: str) -> str:
        """
        Save summary to file
        """
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = Path(original_filename).stem
        summary_filename = f"summary_{base_name}_{timestamp}.md"
        summary_path = self.transcriptions_dir / summary_filename
        
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write(f"# Summary for {original_filename}\n\n")
            f.write(f"**Generated:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("## Summary\n\n")
            f.write(summary)
        
        print(f"💾 Summary saved to: {summary_path}")
        return str(summary_path)
    
    def save_analytics(self, analytics: Dict[str, Any], original_filename: str) -> str:
        """
        Save analytics to JSON file
        """
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = Path(original_filename).stem
        analytics_filename = f"analysis_{base_name}_{timestamp}.json"
        analytics_path = self.transcriptions_dir / analytics_filename
        
        with open(analytics_path, 'w', encoding='utf-8') as f:
            json.dump(analytics, f, indent=2)
        
        print(f"💾 Analytics saved to: {analytics_path}")
        return str(analytics_path)
    
    def process_audio(self, audio_file_path: str) -> Dict[str, Any]:
        """
        Complete pipeline: transcribe, summarize, and analyze audio
        """
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
        
        print(f"\n🚀 Starting processing for: {audio_file_path}")
        print("=" * 50)
        
        # Step 1: Transcribe
        transcript = self.transcribe_audio(audio_file_path)
        transcript_path = self.save_transcription(transcript, audio_file_path)
        
        # Step 2: Summarize
        summary = self.generate_summary(transcript)
        summary_path = self.save_summary(summary, audio_file_path)
        
        # Step 3: Analyze
        analytics = self.extract_analytics(transcript)
        analytics_path = self.save_analytics(analytics, audio_file_path)
        
        # Return results
        results = {
            "transcript": transcript,
            "summary": summary,
            "analytics": analytics,
            "files": {
                "transcript": transcript_path,
                "summary": summary_path,
                "analytics": analytics_path
            }
        }
        
        return results

def display_results(results: Dict[str, Any]):
    """
    Display results in console with nice formatting
    """
    print("\n" + "=" * 50)
    print("🎉 PROCESSING COMPLETE!")
    print("=" * 50)
    
    print("\n📋 SUMMARY:")
    print("-" * 30)
    print(results["summary"])
    
    print("\n📊 ANALYTICS:")
    print("-" * 30)
    analytics = results["analytics"]
    print(f"📝 Word Count: {analytics['word_count']}")
    print(f"⚡ Speaking Speed: {analytics['speaking_speed_wpm']} WPM")
    print(f"\n🏷️  Top Topics:")
    
    for i, topic in enumerate(analytics['frequently_mentioned_topics'], 1):
        print(f"   {i}. {topic['topic']} ({topic['mentions']} mentions)")
    
    print(f"\n💾 FILES CREATED:")
    print("-" * 30)
    for file_type, file_path in results["files"].items():
        print(f"   {file_type.title()}: {file_path}")
    
    print("\n✨ All done! Check the 'transcriptions' folder for your files.")

def main():
    """
    Main application entry point
    """
    parser = argparse.ArgumentParser(
        description="Speech-to-Text Application with AI Analysis",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py audio.wav
  python main.py /path/to/audio.mp3
  python main.py recording.m4a

Supported audio formats: mp3, mp4, mpeg, mpga, m4a, wav, webm
        """
    )
    
    parser.add_argument(
        "audio_file",
        help="Path to the audio file to process"
    )
    
    args = parser.parse_args()
    
    try:
        # Initialize the analyzer
        analyzer = SpeechAnalyzer()
        
        # Process the audio file
        results = analyzer.process_audio(args.audio_file)
        
        # Display results
        display_results(results)
        
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print("Please check that the audio file path is correct.")
    except ValueError as e:
        print(f"❌ Configuration Error: {e}")
        print("Please check your .env file and OpenAI API key.")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        print("Please check your internet connection and try again.")

if __name__ == "__main__":
    main() 