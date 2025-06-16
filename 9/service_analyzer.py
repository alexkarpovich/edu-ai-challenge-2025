#!/usr/bin/env python3
"""
Service Analysis Console Application
====================================

A console application that analyzes services or products and generates 
comprehensive markdown reports from multiple perspectives.

Usage:
    python service_analyzer.py --service "Spotify"
    python service_analyzer.py --text "Your service description here..."
"""

import argparse
import os
import sys
from typing import Optional
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ServiceAnalyzer:
    """Main class for analyzing services and generating reports."""
    
    def __init__(self):
        """Initialize the analyzer with OpenAI client."""
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            print("❌ Error: OPENAI_API_KEY environment variable not found.")
            print("Please set your OpenAI API key in a .env file or environment variable.")
            sys.exit(1)
        
        openai.api_key = self.api_key
        self.client = openai.OpenAI(api_key=self.api_key)
    
    def create_analysis_prompt(self, input_text: str, is_service_name: bool) -> str:
        """Create a comprehensive prompt for service analysis."""
        
        base_prompt = """You are an expert business analyst specializing in digital services and products. 
Your task is to create a comprehensive, well-researched analysis report in markdown format.

"""
        
        if is_service_name:
            specific_prompt = f"""Please analyze the service/product: "{input_text}"

Use your knowledge about this service to provide accurate information. If you're not familiar with the service, clearly state what information is limited or unavailable.
"""
        else:
            specific_prompt = f"""Please analyze the following service/product description:

"{input_text}"

Extract and analyze all available information from the provided text, and use your knowledge to fill in gaps where appropriate.
"""
        
        format_requirements = """
IMPORTANT: Your response must be a well-formatted markdown report with exactly these sections in this order:

# Service Analysis Report

## Brief History
Provide founding year, key milestones, major developments, and evolution timeline.

## Target Audience
Identify primary user segments, demographics, and use cases.

## Core Features
List the top 2-4 key functionalities that define the service.

## Unique Selling Points
Highlight key differentiators that set this service apart from competitors.

## Business Model
Explain how the service generates revenue (subscription, freemium, ads, etc.).

## Tech Stack Insights
Provide any available information about technologies, platforms, or technical architecture used.

## Perceived Strengths
List the main advantages, positive features, and standout capabilities.

## Perceived Weaknesses
Identify potential drawbacks, limitations, or areas for improvement.

## Conclusion
Provide a brief summary and overall assessment.

Requirements:
- Use proper markdown formatting with headers, bullet points, and emphasis
- Be factual and objective in your analysis
- Include specific details where available
- If information is limited, state this clearly
- Keep each section focused and informative
- Aim for comprehensive coverage while being concise
"""
        
        return base_prompt + specific_prompt + format_requirements
    
    def analyze_service(self, input_text: str, is_service_name: bool = True) -> str:
        """Analyze a service and return a comprehensive markdown report."""
        
        try:
            prompt = self.create_analysis_prompt(input_text, is_service_name)
            
            print("🔍 Analyzing service... This may take a moment.")
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert business analyst with deep knowledge of digital services, products, and market trends. Provide accurate, well-researched analysis."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            return f"❌ Error during analysis: {str(e)}\n\nPlease check your OpenAI API key and internet connection."
    
    def save_report(self, report: str, filename: Optional[str] = None) -> str:
        """Save the report to a file and return the filename."""
        if not filename:
            filename = "service_analysis_report.md"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(report)
            return filename
        except Exception as e:
            print(f"❌ Error saving report: {str(e)}")
            return None

def main():
    """Main function to handle command line interface."""
    
    parser = argparse.ArgumentParser(
        description="Analyze services or products and generate comprehensive reports",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python service_analyzer.py --service "Spotify"
  python service_analyzer.py --service "Notion"
  python service_analyzer.py --text "Our platform helps teams collaborate..."
  python service_analyzer.py --service "Slack" --output "slack_analysis.md"
        """
    )
    
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument(
        '--service', '-s',
        type=str,
        help='Name of a known service or product (e.g., "Spotify", "Notion")'
    )
    input_group.add_argument(
        '--text', '-t',
        type=str,
        help='Raw service description text to analyze'
    )
    
    parser.add_argument(
        '--output', '-o',
        type=str,
        help='Output file path (optional, defaults to console output)'
    )
    
    args = parser.parse_args()
    
    # Initialize analyzer
    analyzer = ServiceAnalyzer()
    
    # Determine input type and content
    if args.service:
        input_text = args.service
        is_service_name = True
        print(f"📊 Analyzing service: {input_text}")
    else:
        input_text = args.text
        is_service_name = False
        print(f"📊 Analyzing provided text (first 100 chars): {input_text[:100]}...")
    
    # Generate analysis
    report = analyzer.analyze_service(input_text, is_service_name)
    
    # Output results
    if args.output:
        saved_file = analyzer.save_report(report, args.output)
        if saved_file:
            print(f"✅ Report saved to: {saved_file}")
        print(f"\n📋 Report preview:\n{'-' * 50}")
        print(report[:500] + "..." if len(report) > 500 else report)
    else:
        print(f"\n📋 Analysis Report:\n{'-' * 50}")
        print(report)

if __name__ == "__main__":
    main() 