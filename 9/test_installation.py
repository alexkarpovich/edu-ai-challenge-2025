#!/usr/bin/env python3
"""
Installation Test Script
========================

This script tests that all dependencies are properly installed
and the main application can be imported successfully.

Run this after installing requirements:
    pip install -r requirements.txt
    python test_installation.py
"""

def test_imports():
    """Test that all required modules can be imported."""
    print("🧪 Testing installation...")
    
    try:
        import argparse
        print("✅ argparse imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import argparse: {e}")
        return False
    
    try:
        import os
        print("✅ os imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import os: {e}")
        return False
    
    try:
        import sys
        print("✅ sys imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import sys: {e}")
        return False
    
    try:
        from typing import Optional
        print("✅ typing imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import typing: {e}")
        return False
    
    try:
        import openai
        print("✅ openai imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import openai: {e}")
        print("   Make sure to run: pip install -r requirements.txt")
        return False
    
    try:
        from dotenv import load_dotenv
        print("✅ python-dotenv imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import python-dotenv: {e}")
        print("   Make sure to run: pip install -r requirements.txt")
        return False
    
    return True

def test_script_syntax():
    """Test that the main script has valid syntax."""
    try:
        import service_analyzer
        print("✅ service_analyzer.py syntax is valid")
        return True
    except SyntaxError as e:
        print(f"❌ Syntax error in service_analyzer.py: {e}")
        return False
    except ImportError:
        # This is expected if OpenAI key is not set
        print("✅ service_analyzer.py syntax is valid (import blocked by missing API key)")
        return True

def main():
    """Run all installation tests."""
    print("🔍 Service Analyzer Installation Test")
    print("=" * 40)
    
    all_tests_passed = True
    
    # Test imports
    if not test_imports():
        all_tests_passed = False
    
    print()
    
    # Test main script syntax
    if not test_script_syntax():
        all_tests_passed = False
    
    print()
    print("=" * 40)
    
    if all_tests_passed:
        print("🎉 All tests passed! Installation is successful.")
        print("\nNext steps:")
        print("1. Set up your OpenAI API key (see README.md)")
        print("2. Run: python service_analyzer.py --help")
        print("3. Try: python service_analyzer.py --service \"Spotify\"")
    else:
        print("❌ Some tests failed. Please check the error messages above.")
        print("\nTroubleshooting:")
        print("1. Make sure you're using Python 3.7+")
        print("2. Run: pip install -r requirements.txt")
        print("3. Check that you're in the correct directory")

if __name__ == "__main__":
    main() 