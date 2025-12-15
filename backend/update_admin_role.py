"""
Script to update the admin@gmail.com user role to super_admin
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def update_admin_role():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Update the admin user role to super_admin
    result = await db.users.update_one(
        {"email": "admin@gmail.com"},
        {"$set": {"role": "super_admin", "name": "Super Admin"}}
    )
    
    if result.modified_count > 0:
        print(f"✓ Successfully updated admin@gmail.com to super_admin role")
    else:
        print("✗ No user found or already has super_admin role")
    
    # Verify the update
    user = await db.users.find_one({"email": "admin@gmail.com"}, {"_id": 0, "email": 1, "name": 1, "role": 1})
    if user:
        print(f"\nCurrent user data:")
        print(f"  Email: {user['email']}")
        print(f"  Name: {user['name']}")
        print(f"  Role: {user['role']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_admin_role())
