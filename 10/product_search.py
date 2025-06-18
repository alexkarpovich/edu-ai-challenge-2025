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
            "name": "filter_and_return_products",
            "description": "Filter the product dataset based on user preferences and return matching products",
            "parameters": {
                "type": "object",
                "properties": {
                    "filtered_products": {
                        "type": "array",
                        "description": "Array of products that match the user's criteria",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "category": {"type": "string"},
                                "price": {"type": "number"},
                                "rating": {"type": "number"},
                                "in_stock": {"type": "boolean"}
                            },
                            "required": ["name", "category", "price", "rating", "in_stock"]
                        }
                    },
                    "criteria_used": {
                        "type": "string",
                        "description": "Description of the filtering criteria that were applied"
                    }
                },
                "required": ["filtered_products", "criteria_used"]
            }
        }
    
    def search_products(self, user_query: str) -> List[Dict[str, Any]]:
        """Search products using OpenAI function calling."""
        try:
            # Create the system message with the complete product dataset
            products_data = json.dumps(self.products, indent=2)
            
            system_message = f"""
            You are a product search assistant. You must filter the provided product dataset based on user preferences and return only the matching products.

            PRODUCT DATASET:
            {products_data}

            INSTRUCTIONS:
            1. Analyze the user's natural language query to understand their requirements
            2. Filter the products based on their criteria such as:
               - Category (Electronics, Fitness, Kitchen, Books, Clothing)
               - Price constraints (e.g., "under $100", "between $50-$200")
               - Rating requirements (e.g., "great rating" = 4.5+, "good rating" = 4.0+)
               - Stock availability ("in stock" = in_stock: true)
               - Keywords (match in product names)
            3. Return ONLY the products that match ALL specified criteria
            4. Use the filter_and_return_products function to return results
            
            EXAMPLES:
            - "smartphone under $800" → filter by keyword "smartphone" AND price ≤ 800
            - "fitness equipment with great ratings" → category "Fitness" AND rating ≥ 4.5
            - "kitchen appliances under $100 in stock" → category "Kitchen" AND price ≤ 100 AND in_stock = true
            
            Be precise in filtering - only return products that truly match the user's requirements.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": f"Find products based on: {user_query}"}
                ],
                functions=[self.get_function_definition()],
                function_call={"name": "filter_and_return_products"}
            )
            
            # Extract function call results
            function_call = response.choices[0].message.function_call
            if function_call and function_call.name == "filter_and_return_products":
                arguments = json.loads(function_call.arguments)
                print(f"Criteria applied: {arguments.get('criteria_used', 'N/A')}")
                return arguments.get('filtered_products', [])
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