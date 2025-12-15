import requests
import sys
import json
from datetime import datetime

class HealthcareAPITester:
    def __init__(self, base_url="https://care-connect-hub-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.user_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_user_registration(self):
        """Test user registration"""
        user_data = {
            "email": f"testuser_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "name": "Test User",
            "phone": "1234567890",
            "role": "user"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            return True
        return False

    def test_admin_login(self):
        """Test admin login with provided credentials"""
        login_data = {
            "email": "admin@gmail.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            return True
        return False

    def test_user_profile(self):
        """Test getting user profile"""
        if not self.user_token:
            self.log_test("User Profile", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.user_token}'}
        return self.run_test("User Profile", "GET", "auth/me", 200, headers=headers)[0]

    def test_chat_message(self):
        """Test AI chatbot functionality"""
        if not self.user_token:
            self.log_test("Chat Message", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.user_token}'}
        chat_data = {
            "message": "What are the symptoms of fever?",
            "session_id": None
        }
        
        success, response = self.run_test(
            "Chat Message",
            "POST",
            "chat/message",
            200,
            data=chat_data,
            headers=headers
        )
        
        if success and 'response' in response and 'session_id' in response:
            print(f"   Chat Response: {response['response'][:100]}...")
            return True
        return False

    def test_create_appointment(self):
        """Test creating an appointment"""
        if not self.user_token:
            self.log_test("Create Appointment", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.user_token}'}
        appointment_data = {
            "patient_name": "Test Patient",
            "patient_email": "patient@test.com",
            "patient_phone": "9876543210",
            "doctor_name": "Dr. Smith",
            "appointment_date": "2024-12-25",
            "appointment_time": "10:00",
            "reason": "Regular checkup"
        }
        
        success, response = self.run_test(
            "Create Appointment",
            "POST",
            "appointments",
            200,
            data=appointment_data,
            headers=headers
        )
        
        if success and 'id' in response:
            self.appointment_id = response['id']
            return True
        return False

    def test_get_appointments(self):
        """Test getting appointments"""
        if not self.user_token:
            self.log_test("Get Appointments", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.user_token}'}
        return self.run_test("Get Appointments", "GET", "appointments", 200, headers=headers)[0]

    def test_admin_get_all_appointments(self):
        """Test admin getting all appointments"""
        if not self.admin_token:
            self.log_test("Admin Get All Appointments", False, "No admin token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        return self.run_test("Admin Get All Appointments", "GET", "appointments", 200, headers=headers)[0]

    def test_admin_update_appointment(self):
        """Test admin updating appointment status"""
        if not self.admin_token or not hasattr(self, 'appointment_id'):
            self.log_test("Admin Update Appointment", False, "No admin token or appointment ID")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        update_data = {"status": "confirmed"}
        
        return self.run_test(
            "Admin Update Appointment",
            "PATCH",
            f"appointments/{self.appointment_id}",
            200,
            data=update_data,
            headers=headers
        )[0]

    def test_get_blood_bank(self):
        """Test getting blood bank records"""
        if not self.user_token:
            self.log_test("Get Blood Bank", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.user_token}'}
        return self.run_test("Get Blood Bank", "GET", "blood-bank", 200, headers=headers)[0]

    def test_admin_add_blood_bank(self):
        """Test admin adding blood bank record"""
        if not self.admin_token:
            self.log_test("Admin Add Blood Bank", False, "No admin token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        blood_data = {
            "blood_type": "A+",
            "units_available": 50,
            "hospital_name": "Test Hospital",
            "contact": "123-456-7890",
            "address": "123 Test St, Test City"
        }
        
        success, response = self.run_test(
            "Admin Add Blood Bank",
            "POST",
            "blood-bank",
            200,
            data=blood_data,
            headers=headers
        )
        
        if success and 'id' in response:
            self.blood_id = response['id']
            return True
        return False

    def test_admin_update_blood_bank(self):
        """Test admin updating blood bank record"""
        if not self.admin_token or not hasattr(self, 'blood_id'):
            self.log_test("Admin Update Blood Bank", False, "No admin token or blood ID")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        update_data = {"units_available": 75}
        
        return self.run_test(
            "Admin Update Blood Bank",
            "PATCH",
            f"blood-bank/{self.blood_id}",
            200,
            data=update_data,
            headers=headers
        )[0]

    def test_admin_delete_appointment(self):
        """Test admin deleting appointment"""
        if not self.admin_token or not hasattr(self, 'appointment_id'):
            self.log_test("Admin Delete Appointment", False, "No admin token or appointment ID")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        return self.run_test(
            "Admin Delete Appointment",
            "DELETE",
            f"appointments/{self.appointment_id}",
            200,
            headers=headers
        )[0]

    def test_admin_delete_blood_bank(self):
        """Test admin deleting blood bank record"""
        if not self.admin_token or not hasattr(self, 'blood_id'):
            self.log_test("Admin Delete Blood Bank", False, "No admin token or blood ID")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        return self.run_test(
            "Admin Delete Blood Bank",
            "DELETE",
            f"blood-bank/{self.blood_id}",
            200,
            headers=headers
        )[0]

def main():
    print("🏥 Healthcare Management API Testing")
    print("=" * 50)
    
    tester = HealthcareAPITester()
    
    # Test sequence
    print("\n📡 Testing Basic Connectivity...")
    tester.test_root_endpoint()
    
    print("\n👤 Testing User Authentication...")
    tester.test_user_registration()
    tester.test_admin_login()
    tester.test_user_profile()
    
    print("\n🤖 Testing AI Chatbot...")
    tester.test_chat_message()
    
    print("\n📅 Testing Appointments...")
    tester.test_create_appointment()
    tester.test_get_appointments()
    tester.test_admin_get_all_appointments()
    tester.test_admin_update_appointment()
    
    print("\n🩸 Testing Blood Bank...")
    tester.test_get_blood_bank()
    tester.test_admin_add_blood_bank()
    tester.test_admin_update_blood_bank()
    
    print("\n🗑️ Testing Cleanup Operations...")
    tester.test_admin_delete_appointment()
    tester.test_admin_delete_blood_bank()
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if tester.tests_passed < tester.tests_run:
        print("\n❌ Failed Tests:")
        for result in tester.test_results:
            if not result['success']:
                print(f"   - {result['test']}: {result['details']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())