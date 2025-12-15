from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
from google import genai
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Initialize Gemini client
gemini_client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
# Default to gemini-2.5-flash (free tier, supports images) - can be overridden with GEMINI_MODEL env var
GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str
    role: str = "user"  # "user", "admin", or "super_admin"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class DoctorBase(BaseModel):
    name: str
    specialization: str
    experience: str
    contact: str
    availability: str  # e.g., "Mon-Fri 9AM-5PM"
    gender: str = "male"  # "male" or "female"
    fees: float = 500.0  # Consultation fees

class DoctorCreate(DoctorBase):
    pass

class Doctor(DoctorBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentBase(BaseModel):
    patient_name: str
    patient_email: EmailStr
    patient_phone: str
    doctor_name: str
    appointment_date: str
    appointment_time: str
    reason: str

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    status: str = "pending"  # pending, confirmed, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class BloodBankBase(BaseModel):
    blood_type: str
    units_available: int
    hospital_name: str
    contact: str
    address: str

class BloodBankCreate(BloodBankBase):
    pass

class BloodBank(BloodBankBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BloodBankUpdate(BaseModel):
    units_available: Optional[int] = None
    contact: Optional[str] = None
    address: Optional[str] = None

class PharmacyBase(BaseModel):
    name: str
    address: str
    contact: str
    operating_hours: str
    services: str  # e.g., "24/7, Home Delivery, Online Consultation"
    location: str  # e.g., "Downtown", "Near City Hospital"

class PharmacyCreate(PharmacyBase):
    pass

class Pharmacy(PharmacyBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PharmacyUpdate(BaseModel):
    contact: Optional[str] = None
    operating_hours: Optional[str] = None
    services: Optional[str] = None

class MedicineBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str

class MedicineCreate(MedicineBase):
    pass

class Medicine(MedicineBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderItem(BaseModel):
    medicine_id: str
    medicine_name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_amount: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    items: List[OrderItem]
    total_amount: float
    status: str = "pending" # pending, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    image: Optional[str] = None  # Base64 encoded image
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    image: Optional[str] = None

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_email = payload.get("sub")
        if user_email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"email": user_email}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def get_super_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = user_data.model_dump()
    password = user_dict.pop("password")
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['password_hash'] = hash_password(password)
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    # Create token
    token = create_access_token({"sub": user_obj.email})
    
    return TokenResponse(access_token=token, user=user_obj)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Convert ISO string to datetime if needed
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    user_obj = User(**{k: v for k, v in user.items() if k != 'password_hash'})
    token = create_access_token({"sub": user_obj.email})
    
    return TokenResponse(access_token=token, user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    if isinstance(current_user.get('created_at'), str):
        current_user['created_at'] = datetime.fromisoformat(current_user['created_at'])
    return User(**{k: v for k, v in current_user.items() if k != 'password_hash'})

# ==================== ADMIN MANAGEMENT ROUTES (Super Admin Only) ====================

class AdminCreate(BaseModel):
    email: EmailStr
    name: str
    phone: str
    password: str

@api_router.post("/admin/create", response_model=User)
async def create_admin_user(admin_data: AdminCreate, current_user: dict = Depends(get_super_admin_user)):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": admin_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create admin user
    user_dict = admin_data.model_dump()
    password = user_dict.pop("password")
    user_dict["role"] = "admin"
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['password_hash'] = hash_password(password)
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    return user_obj

@api_router.get("/admin/list", response_model=List[User])
async def list_admin_users(current_user: dict = Depends(get_super_admin_user)):
    # Get all admin users (excluding super_admin)
    admins = await db.users.find({"role": "admin"}, {"_id": 0, "password_hash": 0}).to_list(1000)
    
    for admin in admins:
        if isinstance(admin.get('created_at'), str):
            admin['created_at'] = datetime.fromisoformat(admin['created_at'])
    
    return [User(**admin) for admin in admins]

@api_router.delete("/admin/{admin_id}")
async def delete_admin_user(admin_id: str, current_user: dict = Depends(get_super_admin_user)):
    # Find the user to delete
    user_to_delete = await db.users.find_one({"id": admin_id})
    
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="Admin user not found")
    
    # Prevent deletion of super_admin
    if user_to_delete.get("role") == "super_admin":
        raise HTTPException(status_code=403, detail="Cannot delete super admin")
    
    # Only allow deletion of admin users
    if user_to_delete.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Can only delete admin users")
    
    result = await db.users.delete_one({"id": admin_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin user not found")
    
    return {"message": "Admin user deleted successfully"}

# ==================== CHATBOT ROUTES ====================

@api_router.post("/chat/message", response_model=ChatResponse)
async def send_chat_message(chat_req: ChatRequest, current_user: dict = Depends(get_current_user)):
    try:
        session_id = chat_req.session_id or str(uuid.uuid4())
        
        # Get chat history for this session
        history = await db.chat_history.find(
            {"user_id": current_user['id'], "session_id": session_id},
            {"_id": 0}
        ).sort("timestamp", 1).to_list(100)
        
        # Build conversation context with system message
        system_instruction = """You are a helpful healthcare assistant. Provide medical information, 
        answer health-related questions, and help users understand symptoms. Always remind users 
        to consult with healthcare professionals for serious concerns."""
        
        # Prepare conversation history for Gemini
        conversation_parts = []
        for msg in history:
            conversation_parts.append(f"User: {msg['user_message']}")
            if msg.get('image'):
                conversation_parts.append("[User sent an image]")
            conversation_parts.append(f"Assistant: {msg['bot_response']}")
        
        # Add current message
        conversation_parts.append(f"User: {chat_req.message}")
        
        # Prepare contents for Gemini
        # According to Gemini docs: "When using a single image with text, place the text prompt after the image part"
        import base64
        from google.genai import types
        
        contents = []
        
        # If there's an image, process it first
        if chat_req.image:
            try:
                # Remove header if present (e.g., "data:image/jpeg;base64,")
                image_data = chat_req.image
                mime_type = "image/jpeg"  # Default
                
                if "," in image_data:
                    header, image_data = image_data.split(",", 1)
                    if "data:" in header and ";base64" in header:
                        mime_type = header.split(":")[1].split(";")[0]
                
                image_bytes = base64.b64decode(image_data)
                
                # Create image part - place image first in contents array
                image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
                contents.append(image_part)
            except Exception as img_err:
                logging.error(f"Image processing error: {str(img_err)}")
                # Continue without image if it fails
        
        # Prepare text content: system instruction + conversation history + current message
        full_text = f"{system_instruction}\n\n" + "\n".join(conversation_parts)
        contents.append(full_text)
        
        # Get response from Gemini
        response = await asyncio.to_thread(
            gemini_client.models.generate_content,
            model=GEMINI_MODEL,
            contents=contents
        )
        
        bot_response = response.text
        
        # Save to database
        chat_history_entry = {
            "user_id": current_user['id'],
            "session_id": session_id,
            "user_message": chat_req.message,
            "image": chat_req.image,  # Store base64 image
            "bot_response": bot_response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.chat_history.insert_one(chat_history_entry)
        
        return ChatResponse(response=bot_response, session_id=session_id, image=chat_req.image)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        with open("error.log", "w") as f:
            f.write(error_trace)
        
        error_msg = str(e)
        error_type = type(e).__name__
        
        # Handle quota/resource exhausted errors
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "quota" in error_msg.lower():
            # Extract retry delay if available
            retry_delay = "a minute"
            if "retry" in error_msg.lower() or "50" in error_msg:
                retry_delay = "about a minute"
            
            logging.error(f"Quota exceeded error: {error_msg}")
            raise HTTPException(
                status_code=429, 
                detail=f"AI Service quota exceeded. The free tier has limited requests. Please wait {retry_delay} before trying again, or consider upgrading your API plan."
            )
        
        # Handle image-specific errors
        if "image" in error_msg.lower() or "Part" in error_type:
            logging.error(f"Image processing error: {error_msg}")
            raise HTTPException(
                status_code=400,
                detail=f"Error processing image: {error_msg}. Please ensure the image is in a supported format (JPEG, PNG, etc.) and try again."
            )
        
        logging.error(f"Chat error: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {error_msg}")

@api_router.get("/chat/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    history = await db.chat_history.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("timestamp", -1).limit(50).to_list(50)
    return history

# ==================== DOCTOR ROUTES ====================

@api_router.get("/doctors", response_model=List[Doctor])
async def get_doctors(current_user: dict = Depends(get_current_user)):
    doctors = await db.doctors.find({}, {"_id": 0}).to_list(1000)
    for doc in doctors:
        if isinstance(doc.get('created_at'), str):
            doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doctors

@api_router.post("/doctors", response_model=Doctor)
async def create_doctor(doctor_data: DoctorCreate, current_user: dict = Depends(get_admin_user)):
    doctor_obj = Doctor(**doctor_data.model_dump())
    doc = doctor_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.doctors.insert_one(doc)
    return doctor_obj

@api_router.delete("/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.doctors.delete_one({"id": doctor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"message": "Doctor deleted successfully"}

# ==================== APPOINTMENT ROUTES ====================

# Appointment duration in minutes (doctor needs at least 20 minutes per patient)
APPOINTMENT_DURATION_MINUTES = 20

def parse_time(time_str: str) -> datetime:
    """Parse time string (HH:MM) to datetime object"""
    hour, minute = map(int, time_str.split(':'))
    return datetime(2000, 1, 1, hour, minute)

def time_ranges_overlap(start1: datetime, end1: datetime, start2: datetime, end2: datetime) -> bool:
    """Check if two time ranges overlap"""
    return start1 < end2 and start2 < end1

async def check_appointment_conflict(doctor_name: str, appointment_date: str, appointment_time: str) -> bool:
    """
    Check if there's a conflicting appointment for the given doctor, date, and time.
    Returns True if there's a conflict, False otherwise.
    """
    # Parse the requested appointment time
    requested_time = parse_time(appointment_time)
    requested_end_time = requested_time + timedelta(minutes=APPOINTMENT_DURATION_MINUTES)
    
    # Find all appointments for this doctor on this date that are not cancelled
    existing_appointments = await db.appointments.find({
        "doctor_name": doctor_name,
        "appointment_date": appointment_date,
        "status": {"$ne": "cancelled"}  # Exclude cancelled appointments
    }, {"_id": 0}).to_list(1000)
    
    # Check for overlaps
    for apt in existing_appointments:
        existing_time = parse_time(apt['appointment_time'])
        existing_end_time = existing_time + timedelta(minutes=APPOINTMENT_DURATION_MINUTES)
        
        if time_ranges_overlap(requested_time, requested_end_time, existing_time, existing_end_time):
            return True
    
    return False

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    # Check for appointment conflicts
    has_conflict = await check_appointment_conflict(
        appointment_data.doctor_name,
        appointment_data.appointment_date,
        appointment_data.appointment_time
    )
    
    if has_conflict:
        raise HTTPException(
            status_code=400,
            detail=f"This time slot is not available. The doctor needs at least {APPOINTMENT_DURATION_MINUTES} minutes per patient. Please choose a different time."
        )
    
    appointment_dict = appointment_data.model_dump()
    appointment_dict['user_id'] = current_user['id']
    appointment_obj = Appointment(**appointment_dict)
    
    doc = appointment_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.appointments.insert_one(doc)
    return appointment_obj

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(current_user: dict = Depends(get_current_user)):
    # Admin sees all, user sees only their own
    query = {} if current_user.get('role') == 'admin' else {"user_id": current_user['id']}
    
    appointments = await db.appointments.find(query, {"_id": 0}).to_list(1000)
    
    for apt in appointments:
        if isinstance(apt.get('created_at'), str):
            apt['created_at'] = datetime.fromisoformat(apt['created_at'])
    
    return appointments

@api_router.get("/appointments/booked-slots")
async def get_booked_slots(
    doctor_name: str,
    appointment_date: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all booked time slots for a specific doctor on a specific date.
    Returns a list of time slots that are unavailable (including the 20-minute buffer).
    """
    # Find all appointments for this doctor on this date (excluding cancelled)
    appointments = await db.appointments.find({
        "doctor_name": doctor_name,
        "appointment_date": appointment_date,
        "status": {"$ne": "cancelled"}
    }, {"_id": 0, "appointment_time": 1}).to_list(1000)
    
    # Return the booked times along with duration info
    return {
        "booked_times": [apt['appointment_time'] for apt in appointments],
        "duration_minutes": APPOINTMENT_DURATION_MINUTES
    }

@api_router.patch("/appointments/{appointment_id}", response_model=Appointment)
async def update_appointment(appointment_id: str, update_data: AppointmentUpdate, current_user: dict = Depends(get_admin_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.appointments.find_one_and_update(
        {"id": appointment_id},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if isinstance(result.get('created_at'), str):
        result['created_at'] = datetime.fromisoformat(result['created_at'])
    
    return Appointment(**{k: v for k, v in result.items() if k != '_id'})

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.appointments.delete_one({"id": appointment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted successfully"}

# ==================== BLOOD BANK ROUTES ====================

@api_router.get("/blood-bank", response_model=List[BloodBank])
async def get_blood_bank(current_user: dict = Depends(get_current_user)):
    records = await db.blood_bank.find({}, {"_id": 0}).to_list(1000)
    
    for record in records:
        if isinstance(record.get('last_updated'), str):
            record['last_updated'] = datetime.fromisoformat(record['last_updated'])
    
    return records

@api_router.post("/blood-bank", response_model=BloodBank)
async def create_blood_bank(blood_data: BloodBankCreate, current_user: dict = Depends(get_admin_user)):
    blood_obj = BloodBank(**blood_data.model_dump())
    
    doc = blood_obj.model_dump()
    doc['last_updated'] = doc['last_updated'].isoformat()
    
    await db.blood_bank.insert_one(doc)
    return blood_obj

@api_router.patch("/blood-bank/{blood_id}", response_model=BloodBank)
async def update_blood_bank(blood_id: str, update_data: BloodBankUpdate, current_user: dict = Depends(get_admin_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    update_dict['last_updated'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.blood_bank.find_one_and_update(
        {"id": blood_id},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Blood bank record not found")
    
    if isinstance(result.get('last_updated'), str):
        result['last_updated'] = datetime.fromisoformat(result['last_updated'])
    
    return BloodBank(**{k: v for k, v in result.items() if k != '_id'})

@api_router.delete("/blood-bank/{blood_id}")
async def delete_blood_bank(blood_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.blood_bank.delete_one({"id": blood_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blood bank record not found")
    return {"message": "Blood bank record deleted successfully"}

# ==================== PHARMACY ROUTES ====================

@api_router.get("/pharmacies", response_model=List[Pharmacy])
async def get_pharmacies(current_user: dict = Depends(get_current_user)):
    pharmacies = await db.pharmacies.find({}, {"_id": 0}).to_list(1000)
    
    for pharmacy in pharmacies:
        if isinstance(pharmacy.get('created_at'), str):
            pharmacy['created_at'] = datetime.fromisoformat(pharmacy['created_at'])
    
    return pharmacies

@api_router.post("/pharmacies", response_model=Pharmacy)
async def create_pharmacy(pharmacy_data: PharmacyCreate, current_user: dict = Depends(get_admin_user)):
    pharmacy_obj = Pharmacy(**pharmacy_data.model_dump())
    
    doc = pharmacy_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.pharmacies.insert_one(doc)
    return pharmacy_obj

@api_router.patch("/pharmacies/{pharmacy_id}", response_model=Pharmacy)
async def update_pharmacy(pharmacy_id: str, update_data: PharmacyUpdate, current_user: dict = Depends(get_admin_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.pharmacies.find_one_and_update(
        {"id": pharmacy_id},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Pharmacy not found")
    
    if isinstance(result.get('created_at'), str):
        result['created_at'] = datetime.fromisoformat(result['created_at'])
    
    return Pharmacy(**{k: v for k, v in result.items() if k != '_id'})

@api_router.delete("/pharmacies/{pharmacy_id}")
async def delete_pharmacy(pharmacy_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.pharmacies.delete_one({"id": pharmacy_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pharmacy not found")
    return {"message": "Pharmacy deleted successfully"}

# ==================== MEDICINE ROUTES ====================

@api_router.get("/medicines", response_model=List[Medicine])
async def get_medicines(current_user: dict = Depends(get_current_user)):
    medicines = await db.medicines.find({}, {"_id": 0}).to_list(1000)
    for med in medicines:
        if isinstance(med.get('created_at'), str):
            med['created_at'] = datetime.fromisoformat(med['created_at'])
    return medicines

@api_router.post("/medicines", response_model=Medicine)
async def create_medicine(medicine_data: MedicineCreate, current_user: dict = Depends(get_admin_user)):
    medicine_obj = Medicine(**medicine_data.model_dump())
    doc = medicine_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.medicines.insert_one(doc)
    return medicine_obj

@api_router.delete("/medicines/{medicine_id}")
async def delete_medicine(medicine_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.medicines.delete_one({"id": medicine_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return {"message": "Medicine deleted successfully"}

# ==================== ORDER ROUTES ====================

class OrderUpdate(BaseModel):
    status: Optional[str] = None  # pending, processing, shipped, delivered, completed, cancelled
    admin_notes: Optional[str] = None

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    order_dict = order_data.model_dump()
    order_dict['user_id'] = current_user['id']
    order_dict['user_name'] = current_user['name']
    order_obj = Order(**order_dict)
    
    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.orders.insert_one(doc)
    return order_obj

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: dict = Depends(get_current_user)):
    # Admin sees all, user sees only their own
    if current_user.get('role') in ['admin', 'super_admin']:
        query = {}
    else:
        query = {"user_id": current_user['id']}
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.patch("/orders/{order_id}", response_model=Order)
async def update_order(order_id: str, update_data: OrderUpdate, current_user: dict = Depends(get_admin_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.orders.find_one_and_update(
        {"id": order_id},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if isinstance(result.get('created_at'), str):
        result['created_at'] = datetime.fromisoformat(result['created_at'])
    
    return Order(**{k: v for k, v in result.items() if k != '_id'})

# ==================== BLOOD REQUEST/ORDER ROUTES ====================

class BloodRequestCreate(BaseModel):
    blood_type: str
    units_requested: int
    hospital_name: str
    patient_name: str
    urgency: str = "normal"  # normal, urgent, emergency
    notes: Optional[str] = None

class BloodRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_email: str
    user_phone: str
    blood_type: str
    units_requested: int
    hospital_name: str
    patient_name: str
    urgency: str = "normal"
    notes: Optional[str] = None
    status: str = "pending"  # pending, approved, rejected, completed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BloodRequestUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None

@api_router.post("/blood-requests", response_model=BloodRequest)
async def create_blood_request(request_data: BloodRequestCreate, current_user: dict = Depends(get_current_user)):
    request_dict = request_data.model_dump()
    request_dict['user_id'] = current_user['id']
    request_dict['user_name'] = current_user['name']
    request_dict['user_email'] = current_user['email']
    request_dict['user_phone'] = current_user.get('phone', '')
    request_obj = BloodRequest(**request_dict)
    
    doc = request_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.blood_requests.insert_one(doc)
    return request_obj

@api_router.get("/blood-requests", response_model=List[BloodRequest])
async def get_blood_requests(current_user: dict = Depends(get_current_user)):
    # Admin sees all, user sees only their own
    if current_user.get('role') in ['admin', 'super_admin']:
        query = {}
    else:
        query = {"user_id": current_user['id']}
    
    requests = await db.blood_requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for req in requests:
        if isinstance(req.get('created_at'), str):
            req['created_at'] = datetime.fromisoformat(req['created_at'])
    
    return requests

@api_router.patch("/blood-requests/{request_id}", response_model=BloodRequest)
async def update_blood_request(request_id: str, update_data: BloodRequestUpdate, current_user: dict = Depends(get_admin_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.blood_requests.find_one_and_update(
        {"id": request_id},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Blood request not found")
    
    if isinstance(result.get('created_at'), str):
        result['created_at'] = datetime.fromisoformat(result['created_at'])
    
    return BloodRequest(**{k: v for k, v in result.items() if k != '_id'})

@api_router.delete("/blood-requests/{request_id}")
async def delete_blood_request(request_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.blood_requests.delete_one({"id": request_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blood request not found")
    return {"message": "Blood request deleted successfully"}

# ==================== SETUP ====================

@api_router.get("/")
async def root():
    return {"message": "Healthcare Management API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    # Create default super admin user
    admin_exists = await db.users.find_one({"email": "admin@gmail.com"})
    if not admin_exists:
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": "admin@gmail.com",
            "name": "Super Admin",
            "phone": "0000000000",
            "role": "super_admin",
            "password_hash": hash_password("admin123"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        logger.info("Default super admin user created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()