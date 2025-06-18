# AI-Powered Product Search Tool

A console-based product search application that uses OpenAI's function calling to filter products based on natural language user preferences.

## Features

- **Natural Language Processing**: Describe what you're looking for in plain English
- **OpenAI Function Calling**: Leverages AI to intelligently extract search criteria
- **Comprehensive Filtering**: Supports filtering by category, price range, rating, stock status, and keywords
- **Interactive Console Interface**: Easy-to-use command-line interface
- **Structured Output**: Clear, formatted results with all product details

## Requirements

- Python 3.7+
- OpenAI API key
- Internet connection

## Installation

### 1. Clone or Download the Project

If you haven't already, make sure you have this project folder on your local machine.

### 2. Navigate to the Project Directory

```bash
cd 10
```

### 3. Create a Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Set up Environment Variables

```bash
# Copy the example environment file
cp env_example.txt .env

# Edit .env file and add your OpenAI API key
# You can use any text editor, for example:
nano .env
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

**How to get an OpenAI API key:**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it in your `.env` file

## Usage

### Running the Application

```bash
python product_search.py
```

### Example Queries

The application accepts natural language queries. Here are some examples:

- `"I need a smartphone under $800"`
- `"Find me fitness equipment with great ratings"`
- `"Looking for kitchen appliances under $100 that are in stock"`
- `"Show me wireless headphones with rating above 4.5"`
- `"I want electronics under $50"`
- `"Find books about programming"`
- `"Show me men's clothing items"`

### Interactive Interface

1. Start the application with `python product_search.py`
2. You'll see a welcome message with example queries
3. Enter your search query in natural language
4. The application will:
   - Process your query with OpenAI
   - Extract filtering criteria
   - Search the product database
   - Display formatted results
5. Type `quit`, `exit`, or `q` to exit the application

## How It Works

1. **Natural Language Processing**: Your query is sent to OpenAI's GPT model
2. **Function Calling**: OpenAI uses function calling to extract structured filtering criteria
3. **Product Filtering**: The application filters the product database based on the extracted criteria
4. **Results Display**: Matching products are displayed in a clear, structured format

## Supported Filter Criteria

The application can filter products based on:

- **Category**: Electronics, Fitness, Kitchen, Books, Clothing
- **Price Range**: Minimum and maximum price limits
- **Rating**: Minimum rating threshold (0.0 to 5.0)
- **Stock Status**: In stock or all products
- **Keywords**: Product name keywords (e.g., "wireless", "gaming", "smart")

## Dataset

The application uses a JSON dataset (`products.json`) containing 50 products across 5 categories:
- Electronics (smartphones, laptops, headphones, etc.)
- Fitness (yoga mats, dumbbells, exercise bikes, etc.)
- Kitchen (blenders, air fryers, coffee makers, etc.)
- Books (novels, programming guides, cookbooks, etc.)
- Clothing (t-shirts, jeans, shoes, etc.)

Each product includes:
- Name
- Category
- Price
- Rating (4.0 to 4.8)
- Stock availability

## Troubleshooting

### Common Issues

1. **"OpenAI API key not found"**
   - Make sure you've created the `.env` file
   - Verify your API key is correctly set in the `.env` file
   - Ensure there are no extra spaces or quotes around the key

2. **"Products file 'products.json' not found"**
   - Make sure `products.json` is in the same directory as `product_search.py`
   - Check that the file wasn't accidentally moved or deleted

3. **OpenAI API errors**
   - Verify your API key is valid and has credits
   - Check your internet connection
   - Ensure you haven't exceeded rate limits

4. **No results found**
   - Try rephrasing your query
   - Make sure your criteria aren't too restrictive
   - Check if the products you're looking for exist in the dataset

### Getting Help

If you encounter issues:
1. Check the error message for specific details
2. Verify all setup steps were completed correctly
3. Make sure your OpenAI API key is valid and has credits
4. Try with a simpler query first

## Example Output

```
============================================================
      Welcome to the AI-Powered Product Search Tool
============================================================

Describe what you're looking for in natural language.
Examples:
- 'I need a smartphone under $800'
- 'Find me fitness equipment with great ratings'
- 'Looking for kitchen appliances under $100 that are in stock'

Type 'quit' to exit.
------------------------------------------------------------

What are you looking for? I need wireless headphones under $150

Searching for: 'I need wireless headphones under $150'
Processing with OpenAI...
Extracted criteria: {'max_price': 150, 'product_keywords': ['wireless', 'headphones'], 'in_stock_only': true}

Filtered Products (2 found):
------------------------------------------------------------
1. Wireless Headphones - $99.99, Rating: 4.5, In Stock
   Category: Electronics

2. Noise-Cancelling Headphones - $299.99, Rating: 4.8, In Stock
   Category: Electronics
```

## Security Notes

- Never commit your `.env` file to version control
- Keep your OpenAI API key secure and don't share it
- The `.env` file is already included in `.gitignore` to prevent accidental commits

## License

This project is created for educational purposes as part of the AI challenge. 