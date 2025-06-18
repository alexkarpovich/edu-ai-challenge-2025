#!/usr/bin/env python3
"""
Product Search Console Application

This application uses OpenAI's function calling to filter products
based on natural language user preferences.
"""

import json
import os
import sys
from typing import List, Dict, Any
from openai import OpenAI
from dotenv import load_dotenv


# Load environment variables
load_dotenv()


class ProductSearchTool:
    def __init__(self, products_file: str = "products.json"):
        """Initialize the product search tool."""
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.products = self.load_products(products_file)
        
        if not self.client.api_key:
            raise ValueError("OpenAI API key not found. Please set OPENAI_API_KEY in your .env file.")
    
    def load_products(self, file_path: str) -> List[Dict[str, Any]]:
        """Load products from JSON file."""
        try:
            with open(file_path, 'r') as file:
                products = json.load(file)
            print(f"Loaded {len(products)} products from {file_path}")
            return products
        except FileNotFoundError:
            print(f"Error: Products file '{file_path}' not found.")
            sys.exit(1)
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON in '{file_path}'.")
            sys.exit(1)
    
    def get_function_definition(self) -> Dict[str, Any]:
        """Define the function schema for OpenAI function calling."""
        return {
            "name": "filter_products",
            "description": "Filter products based on user preferences including category, price range, rating, and stock availability",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": "Product category (Electronics, Fitness, Kitchen, Books, Clothing)",
                        "enum": ["Electronics", "Fitness", "Kitchen", "Books", "Clothing"]
                    },
                    "max_price": {
                        "type": "number",
                        "description": "Maximum price the user is willing to pay"
                    },
                    "min_price": {
                        "type": "number",
                        "description": "Minimum price range (optional)"
                    },
                    "min_rating": {
                        "type": "number",
                        "description": "Minimum product rating (0.0 to 5.0)"
                    },
                    "in_stock_only": {
                        "type": "boolean",
                        "description": "Whether to show only products that are in stock"
                    },
                    "product_keywords": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Keywords to match in product names (e.g., 'wireless', 'gaming', 'smart')"
                    }
                }
            }
        }
    
    def filter_products(self, **kwargs) -> List[Dict[str, Any]]:
        """Filter products based on the provided criteria."""
        filtered_products = self.products.copy()
        
        # Filter by category
        if kwargs.get("category"):
            filtered_products = [p for p in filtered_products if p["category"] == kwargs["category"]]
        
        # Filter by price range
        if kwargs.get("max_price") is not None:
            filtered_products = [p for p in filtered_products if p["price"] <= kwargs["max_price"]]
        
        if kwargs.get("min_price") is not None:
            filtered_products = [p for p in filtered_products if p["price"] >= kwargs["min_price"]]
        
        # Filter by minimum rating
        if kwargs.get("min_rating") is not None:
            filtered_products = [p for p in filtered_products if p["rating"] >= kwargs["min_rating"]]
        
        # Filter by stock availability
        if kwargs.get("in_stock_only"):
            filtered_products = [p for p in filtered_products if p["in_stock"]]
        
        # Filter by product keywords
        if kwargs.get("product_keywords"):
            keywords = [kw.lower() for kw in kwargs["product_keywords"]]
            filtered_products = [
                p for p in filtered_products 
                if any(keyword in p["name"].lower() for keyword in keywords)
            ]
        
        return filtered_products
    
    def search_products(self, user_query: str) -> List[Dict[str, Any]]:
        """Search products using OpenAI function calling."""
        try:
            # Create the system message with product information
            system_message = f"""
            You are a product search assistant. You help users find products from a dataset based on their natural language preferences.
            
            Available product categories: Electronics, Fitness, Kitchen, Books, Clothing
            Price range in dataset: $9.99 to $1299.99
            Rating range: 4.0 to 4.8
            
            Analyze the user's request and extract filtering criteria. Use the filter_products function to find matching products.
            Be intelligent about interpreting requests - for example:
            - "under $X" means max_price = X
            - "great rating" might mean min_rating = 4.5
            - "in stock" means in_stock_only = true
            - "smartphone", "laptop", etc. are keywords to match
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": f"Find products based on: {user_query}"}
                ],
                functions=[self.get_function_definition()],
                function_call={"name": "filter_products"}
            )
            
            # Extract function call arguments
            function_call = response.choices[0].message.function_call
            if function_call and function_call.name == "filter_products":
                arguments = json.loads(function_call.arguments)
                print(f"Extracted criteria: {arguments}")
                return self.filter_products(**arguments)
            else:
                print("No function call made by OpenAI.")
                return []
                
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            return []
    
    def format_results(self, products: List[Dict[str, Any]]) -> None:
        """Format and display the search results."""
        if not products:
            print("\nNo products found matching your criteria.")
            return
        
        print(f"\nFiltered Products ({len(products)} found):")
        print("-" * 60)
        
        for i, product in enumerate(products, 1):
            stock_status = "In Stock" if product["in_stock"] else "Out of Stock"
            print(f"{i}. {product['name']} - ${product['price']}, Rating: {product['rating']}, {stock_status}")
            print(f"   Category: {product['category']}")
            print()
    
    def run_interactive_search(self):
        """Run the interactive product search."""
        print("=" * 60)
        print("      Welcome to the AI-Powered Product Search Tool")
        print("=" * 60)
        print("\nDescribe what you're looking for in natural language.")
        print("Examples:")
        print("- 'I need a smartphone under $800'")
        print("- 'Find me fitness equipment with great ratings'")
        print("- 'Looking for kitchen appliances under $100 that are in stock'")
        print("\nType 'quit' to exit.")
        print("-" * 60)
        
        while True:
            try:
                user_input = input("\nWhat are you looking for? ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("Thank you for using the Product Search Tool!")
                    break
                
                if not user_input:
                    print("Please enter a search query.")
                    continue
                
                print(f"\nSearching for: '{user_input}'")
                print("Processing with OpenAI...")
                
                results = self.search_products(user_input)
                self.format_results(results)
                
            except KeyboardInterrupt:
                print("\n\nGoodbye!")
                break
            except Exception as e:
                print(f"An error occurred: {e}")


def main():
    """Main function to run the application."""
    try:
        search_tool = ProductSearchTool()
        search_tool.run_interactive_search()
    except Exception as e:
        print(f"Failed to initialize application: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 