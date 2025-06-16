# Service Analysis Console Application

A powerful console application that analyzes services or products and generates comprehensive, markdown-formatted reports from multiple perspectives including business, technical, and user-focused viewpoints.

## Features

- 📊 **Dual Input Modes**: Accept either known service names (e.g., "Spotify", "Notion") or raw service description text
- 🤖 **AI-Powered Analysis**: Uses OpenAI's GPT-4 for intelligent analysis and report generation
- 📝 **Comprehensive Reports**: Generates structured markdown reports with 8 key analysis sections
- 💾 **Flexible Output**: Display in console or save to file
- 🔒 **Secure**: API key management through environment variables

## Report Sections

Each generated report includes:

1. **Brief History** - Founding year, milestones, and evolution timeline
2. **Target Audience** - Primary user segments and demographics  
3. **Core Features** - Top 2-4 key functionalities
4. **Unique Selling Points** - Key differentiators from competitors
5. **Business Model** - Revenue generation strategies
6. **Tech Stack Insights** - Technologies and architecture details
7. **Perceived Strengths** - Main advantages and standout features
8. **Perceived Weaknesses** - Limitations and areas for improvement

## Prerequisites

- Python 3.7 or higher
- OpenAI API key
- Internet connection

## Installation

1. **Clone or download** the project files to your local machine

2. **Navigate to the project directory**:
   ```bash
   cd 9
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up your OpenAI API key**:
   
   **Option A: Using .env file (Recommended)**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your actual API key
   # Replace 'your_openai_api_key_here' with your actual OpenAI API key
   ```
   
   **Option B: Using environment variable**
   ```bash
   # Linux/macOS
   export OPENAI_API_KEY="your_actual_api_key_here"
   
   # Windows
   set OPENAI_API_KEY=your_actual_api_key_here
   ```

## Usage

### Basic Usage

**Analyze a known service:**
```bash
python service_analyzer.py --service "Spotify"
```

**Analyze custom service description:**
```bash
python service_analyzer.py --text "A cloud-based project management tool that helps teams organize tasks, track progress, and collaborate effectively using kanban boards and real-time notifications."
```

### Advanced Usage

**Save report to file:**
```bash
python service_analyzer.py --service "Notion" --output "notion_analysis.md"
```

**Using short flags:**
```bash
python service_analyzer.py -s "Slack" -o "slack_report.md"
python service_analyzer.py -t "Your service description" -o "custom_analysis.md"
```

### Getting Help

```bash
python service_analyzer.py --help
```

## Output Examples

The application generates well-formatted markdown reports. Here's what you can expect:

### Console Output
When run without `--output` flag, the report is displayed directly in the terminal with clear formatting and emojis for better readability.

### File Output  
When using `--output filename.md`, the report is saved to the specified file and a preview is shown in the console.

## Troubleshooting

### Common Issues

**"OPENAI_API_KEY environment variable not found"**
- Make sure you've set up your API key correctly (see Installation step 4)
- Verify your .env file is in the same directory as the script
- Check that your API key is valid and has sufficient credits

**"Error during analysis: ..."**
- Check your internet connection
- Verify your OpenAI API key is valid and active
- Ensure you have sufficient API credits

**Import errors**
- Run `pip install -r requirements.txt` to install all dependencies
- Make sure you're using Python 3.7 or higher

### API Key Security

- ⚠️ **Never commit your actual API key to version control**
- Use the `.env` file approach for local development
- For production environments, use secure environment variable management
- The `.env` file is already included in `.gitignore` patterns

## Examples

See `sample_outputs.md` for detailed examples of actual application runs and their outputs.

## Technical Details

- **Language**: Python 3.7+
- **AI Model**: OpenAI GPT-4
- **Key Libraries**: 
  - `openai` - OpenAI API client
  - `python-dotenv` - Environment variable management
  - `argparse` - Command-line interface

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all installation steps were completed correctly
3. Ensure your OpenAI API key is valid and has sufficient credits
4. Check that all dependencies are properly installed

## License

This project is for educational and demonstration purposes. 