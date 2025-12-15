import requests
import base64
import json

# Create a simple 1x1 white pixel image
# 100x100 red square in base64 (PNG)
base64_image = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMjHxIGmVAAAAKUlEQVR4Xu3BMQEAAADCIPunNsYeYAAAAAAAAAAAAAAAAAAAAAAAAI8aaWQAAW906DkAAAAASUVORK5CYII="

# Login to get token
login_url = "http://localhost:8000/api/auth/login"
login_data = {
    "email": "admin@gmail.com",
    "password": "admin123"
}

try:
    print("Logging in...")
    response = requests.post(login_url, json=login_data)
    response.raise_for_status()
    token = response.json()["access_token"]
    print("Login successful.")

    # Send chat message with image
    chat_url = "http://localhost:8000/api/chat/message"
    headers = {"Authorization": f"Bearer {token}"}
    chat_data = {
        "message": "What color is this image?",
        "image": f"data:image/png;base64,{base64_image}"
    }

    print("Sending chat message with image...")
    chat_response = requests.post(chat_url, json=chat_data, headers=headers)
    chat_response.raise_for_status()
    
    print("Response from chatbot:")
    print(json.dumps(chat_response.json(), indent=2))
    print("\nVerification Successful!")

except Exception as e:
    print(f"\nVerification Failed: {e}")
    if 'response' in locals():
        print(f"Response content: {response.text}")
