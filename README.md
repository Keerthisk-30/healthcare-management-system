\# 🏥 Integrated Healthcare Platform



\## 📌 Overview



The \*\*Integrated Healthcare Platform\*\* is a comprehensive, AI-enhanced, full-stack web application designed to unify essential healthcare services into a single, accessible ecosystem. Traditional healthcare systems often operate through fragmented platforms, requiring users to visit multiple applications for doctor appointments, blood availability, pharmacy services, and health guidance. This fragmentation leads to inefficiency and delays, especially during medical emergencies.



This platform bridges these gaps by integrating \*\*doctor appointment scheduling, blood bank management, pharmacy services, and AI-powered healthcare assistance\*\* into one streamlined interface. It enables patients, healthcare professionals, and administrators to interact seamlessly while ensuring fast, secure, and reliable access to critical healthcare services.



---



\## 🎯 Objectives



\- To provide a \*\*single unified platform\*\* for essential healthcare services  

\- To reduce delays caused by fragmented healthcare systems  

\- To enhance healthcare accessibility during emergencies  

\- To automate and streamline healthcare workflows  

\- To leverage \*\*AI-powered assistance\*\* for intelligent healthcare interactions  



---



\## 🚀 Key Features



\### 👤 User Module

\- User registration and authentication  

\- Book and manage doctor appointments  

\- Order medicines from registered pharmacies  

\- Request blood from blood banks  

\- View appointment history and order status  



\### 🩺 Doctor \& Appointment Management

\- Add and manage doctor profiles  

\- Appointment slot management  

\- View booked appointments  



\### 🩸 Blood Bank Management

\- Manage blood bank details  

\- Check real-time blood availability  

\- Handle blood requests  



\### 💊 Pharmacy Management

\- Manage pharmacy profiles  

\- Maintain medicine inventory  

\- Place and track medicine orders  



\### 🤖 AI-Powered Healthcare Assistant

\- Chat-based health guidance  

\- AI responses powered by \*\*Google Gemini AI\*\*  

\- Supports basic healthcare-related queries  



\### 🔐 Admin \& Super Admin Panel

\- Create and manage admin users  

\- Role-based access control  

\- Monitor system activities  



---



\## 🏗️ System Architecture



The platform follows a modern \*\*full-stack architecture\*\*:



\- \*\*Frontend\*\*: React, Tailwind CSS, CRACO  

\- \*\*Backend\*\*: FastAPI (Python)  

\- \*\*Database\*\*: MongoDB  

\- \*\*AI Integration\*\*: Google Gemini AI  

\- \*\*Communication\*\*: RESTful APIs  



---



\## 🧑‍💻 Technology Stack



\### Frontend

\- React  

\- Tailwind CSS  

\- React Router  

\- Axios  



\### Backend

\- FastAPI  

\- Python  

\- Uvicorn  

\- JWT Authentication  



\### Database

\- MongoDB  



\### AI \& Tools

\- Google Gemini AI  

\- Passlib \& Bcrypt  

\- Swagger UI / Postman  



---



\## ⚙️ Installation \& Setup



\### 🔹 Prerequisites

\- Node.js (v18+ recommended)  

\- Python (v3.10+)  

\- MongoDB  

\- Git  



---



\### 🔹 Backend Setup



```bash

cd backend

python -m venv venv

venv\\Scripts\\activate

pip install -r requirements.txt

uvicorn server:app --reload



\###Backend runs at:

http://127.0.0.1:8000



\###🔹 Frontend Setup



cd frontend

yarn install

yarn start



\### Frontend will run on:

http://localhost:3000



📡 API Documentation



The backend provides interactive API documentation using Swagger UI:



Swagger UI: http://127.0.0.1:8000/docs



OpenAPI JSON: http://127.0.0.1:8000/openapi.json



🔐 Environment Variables



Create .env files for backend and frontend as needed.



Example (Backend .env)



MONGO\_URL=your\_mongodb\_connection\_string

DB\_NAME=your\_database\_name

JWT\_SECRET=your\_secret\_key

GEMINI\_API\_KEY=your\_gemini\_api\_key



🧪 Testing



Backend unit tests using PyTest

API testing using Swagger UI / Postman



📦 Project Structure



app/

├── backend/

├── frontend/

├── tests/

├── .gitignore

└── README.md





🚀 Future Enhancements

Video consultation support

Mobile application integration

Advanced AI diagnostics

Payment gateway integration

Multi-language support



📄 License

This project is developed for academic and learning purposes.



⭐ Acknowledgements

FastAPI Documentation

React \& Tailwind CSS Community

Google Gemini AI



✨ This project demonstrates a real-world full-stack healthcare solution with AI integration, making it suitable for academic submissions, portfolios, and interview discussions.





