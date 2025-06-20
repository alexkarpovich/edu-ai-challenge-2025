# Quick Start Guide

Get up and running in 3 minutes!

## 1. Setup (30 seconds)

```bash
# Copy environment file
cp env_example.txt .env

# Edit .env and add your OpenAI API key
# Replace 'your_openai_api_key_here' with your actual key
```

## 2. Install Dependencies (1 minute)

```bash
# Option A: Automated setup
python setup.py

# Option B: Manual installation
pip install -r requirements.txt
```

## 3. Run Demo (1 minute)

```bash
# Test with included sample audio
python demo.py

# Or run directly
python main.py CAR0004.mp3
```

## Need Help?

- 📖 Read the full [README.md](README.md)
- 🔑 Get your API key: https://platform.openai.com/api-keys
- 🐛 Check common issues in the README troubleshooting section

## File Structure After Running

```
11/
├── main.py                 # Main application
├── transcriptions/         # Generated files
│   ├── transcription_*.md  # Audio transcripts
│   ├── summary_*.md        # AI summaries
│   └── analysis_*.json     # Analytics data
└── ... other files
```

That's it! 🎉 