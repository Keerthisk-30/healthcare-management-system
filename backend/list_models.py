import os
from google import genai
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

try:
    print("Listing models...")
    for model in client.models.list():
        print(f"Name: {model.name}")
        print(f"Display Name: {model.display_name}")
        print("-" * 20)
except Exception as e:
    print(f"Error: {e}")
