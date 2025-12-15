import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Calendar, Droplet, LogOut, Shield, Trash2, UserPlus, Pill, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bloodBank, setBloodBank] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
      fetchDoctors();
    } else if (activeTab === 'bloodbank') {
      fetchBloodBank();
      fetchBloodRequests();
    } else if (activeTab === 'pharmacies') {
      fetchPharmacies();
      fetchMedicines();
      fetchOrders();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments`);
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API}/doctors`);
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    }
  };

  const fetchBloodBank = async () => {
    try {
      const response = await axios.get(`${API}/blood-bank`);
      setBloodBank(response.data);
    } catch (error) {
      toast.error('Failed to load blood bank data');
    }
  };

  const fetchBloodRequests = async () => {
    try {
      const response = await axios.get(`${API}/blood-requests`);
      setBloodRequests(response.data);
    } catch (error) {
      toast.error('Failed to load blood requests');
    }
  };

  const updateBloodRequestStatus = async (requestId, newStatus) => {
    try {
      await axios.patch(`${API}/blood-requests/${requestId}`, { status: newStatus });
      toast.success(`Blood request ${newStatus}`);
      fetchBloodRequests();
    } catch (error) {
      toast.error('Failed to update blood request');
    }
  };

  const fetchPharmacies = async () => {
    try {
      const response = await axios.get(`${API}/pharmacies`);
      setPharmacies(response.data);
    } catch (error) {
      toast.error('Failed to load pharmacies');
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await axios.get(`${API}/medicines`);
      setMedicines(response.data);
    } catch (error) {
      toast.error('Failed to load medicines');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API}/orders/${orderId}`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await axios.patch(`${API}/appointments/${appointmentId}`, { status: newStatus });
      toast.success('Appointment status updated');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      await axios.delete(`${API}/appointments/${appointmentId}`);
      toast.success('Appointment deleted');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to delete appointment');
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const doctorData = {
      name: formData.get('name'),
      specialization: formData.get('specialization'),
      experience: formData.get('experience'),
      contact: formData.get('contact'),
      availability: formData.get('availability'),
      gender: formData.get('gender') || 'male',
      fees: parseFloat(formData.get('fees')) || 500,
    };

    try {
      await axios.post(`${API}/doctors`, doctorData);
      toast.success('Doctor added successfully');
      e.target.reset();
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to add doctor');
    }
  };

  const deleteDoctor = async (doctorId) => {
    try {
      await axios.delete(`${API}/doctors/${doctorId}`);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to delete doctor');
    }
  };

  const handleAddBloodBank = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bloodData = {
      blood_type: formData.get('blood_type'),
      units_available: parseInt(formData.get('units_available')),
      hospital_name: formData.get('hospital_name'),
      contact: formData.get('contact'),
      address: formData.get('address'),
    };

    try {
      await axios.post(`${API}/blood-bank`, bloodData);
      toast.success('Blood bank record added');
      e.target.reset();
      fetchBloodBank();
    } catch (error) {
      toast.error('Failed to add blood bank record');
    }
  };

  const updateBloodBank = async (bloodId, units) => {
    try {
      await axios.patch(`${API}/blood-bank/${bloodId}`, { units_available: parseInt(units) });
      toast.success('Blood bank record updated');
      fetchBloodBank();
    } catch (error) {
      toast.error('Failed to update blood bank record');
    }
  };

  const deleteBloodBank = async (bloodId) => {
    try {
      await axios.delete(`${API}/blood-bank/${bloodId}`);
      toast.success('Blood bank record deleted');
      fetchBloodBank();
    } catch (error) {
      toast.error('Failed to delete blood bank record');
    }
  };

  const handleAddPharmacy = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const pharmacyData = {
      name: formData.get('name'),
      address: formData.get('address'),
      contact: formData.get('contact'),
      operating_hours: formData.get('operating_hours'),
      services: formData.get('services'),
      location: formData.get('location'),
    };

    try {
      await axios.post(`${API}/pharmacies`, pharmacyData);
      toast.success('Pharmacy added successfully');
      e.target.reset();
      fetchPharmacies();
    } catch (error) {
      toast.error('Failed to add pharmacy');
    }
  };

  const updatePharmacy = async (pharmacyId, updateData) => {
    try {
      await axios.patch(`${API}/pharmacies/${pharmacyId}`, updateData);
      toast.success('Pharmacy updated successfully');
      fetchPharmacies();
    } catch (error) {
      toast.error('Failed to update pharmacy');
    }
  };

  const deletePharmacy = async (pharmacyId) => {
    try {
      await axios.delete(`${API}/pharmacies/${pharmacyId}`);
      toast.success('Pharmacy deleted successfully');
      fetchPharmacies();
    } catch (error) {
      toast.error('Failed to delete pharmacy');
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const medicineData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      stock: parseInt(formData.get('stock')),
      category: formData.get('category'),
    };

    try {
      await axios.post(`${API}/medicines`, medicineData);
      toast.success('Medicine added successfully');
      e.target.reset();
      fetchMedicines();
    } catch (error) {
      toast.error('Failed to add medicine');
    }
  };

  const deleteMedicine = async (medicineId) => {
    try {
      await axios.delete(`${API}/medicines/${medicineId}`);
      toast.success('Medicine deleted successfully');
      fetchMedicines();
    } catch (error) {
      toast.error('Failed to delete medicine');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#2FAF8A]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#235A87]/20 blur-[120px]" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-[#D7A037]/20 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="backdrop-blur-xl bg-white/80 sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="logo-container">
              <svg className="ecg-svg" viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
                <path className="ecg-line" d="M0 25 L55 25 L65 5 L75 45 L85 25 L150 25" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#235A87] to-[#2FAF8A]">Portal</span>
              </h1>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Welcome, {user.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-xl">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 perspective-1000">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200 shadow-lg" data-testid="admin-tabs">
            <TabsTrigger value="appointments" className="gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#235A87] transition-all duration-300 font-medium" data-testid="admin-appointments-tab">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Appointments & Doctors</span>
            </TabsTrigger>
            <TabsTrigger value="bloodbank" className="gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#D44A3A] transition-all duration-300 font-medium" data-testid="admin-bloodbank-tab">
              <Droplet className="w-4 h-4" />
              <span className="hidden sm:inline">Blood Bank</span>
            </TabsTrigger>
            <TabsTrigger value="pharmacies" className="gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#D7A037] transition-all duration-300 font-medium" data-testid="admin-pharmacies-tab">
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Pharmacies & Medicines</span>
            </TabsTrigger>
          </TabsList>

          {/* Appointments Management - Enhanced Style ONLY (No Functionality Changes) */}
<TabsContent value="appointments" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500" data-testid="admin-appointments-content">
  <Tabs defaultValue="view-appointments" className="w-full">
    <TabsList className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-2xl border border-blue-100 shadow-md w-fit">
      <TabsTrigger value="view-appointments" className="px-6 py-3 font-medium rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">View Appointments</TabsTrigger>
      <TabsTrigger value="manage-doctors" className="px-6 py-3 font-medium rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">Manage Doctors</TabsTrigger>
    </TabsList>

    <TabsContent value="view-appointments">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>All Appointments</CardTitle>
          <CardDescription style={{ fontFamily: 'Inter, sans-serif' }}>Manage patient appointments</CardDescription>
        </div>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] p-8" data-testid="admin-appointments-list">
            {appointments.length === 0 ? (
              <div className="text-center py-16 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200 p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="text-4xl mb-4">📅</div>
                No appointments yet
              </div>
            ) : (
              <div className="space-y-6">
                {appointments.map((apt, idx) => (
                  <div key={apt.id} className="p-8 bg-white/80 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300" data-testid={`admin-appointment-${idx}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h4 className="font-bold text-2xl text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {apt.patient_name}
                        </h4>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-base text-gray-700 p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <p><span className="font-semibold text-blue-600">Doctor:</span> Dr. {apt.doctor_name}</p>
                          <p><span className="font-semibold text-green-600">Date:</span> {apt.appointment_date} at {apt.appointment_time}</p>
                          <p><span className="font-semibold text-purple-600">Email:</span> {apt.patient_email}</p>
                          <p><span className="font-semibold text-orange-600">Phone:</span> {apt.patient_phone}</p>
                          <p className="col-span-2 mt-4 text-lg"><span className="font-semibold text-red-600">Reason:</span> {apt.reason}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 ml-8 shrink-0">
                        <Badge className={getStatusColor(apt.status)} data-testid={`admin-appointment-status-${idx}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 rounded-b-2xl">
                      <Select onValueChange={(value) => updateAppointmentStatus(apt.id, value)} data-testid={`admin-status-select-${idx}`}>
                        <SelectTrigger className="w-48 h-14 bg-white/70 border-2 border-blue-200 shadow-md hover:border-blue-400 rounded-xl" style={{ fontSize: '16px' }}>
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="lg" className="h-14 px-8 rounded-xl shadow-lg hover:shadow-xl border-2 border-red-200" data-testid={`admin-delete-appointment-${idx}`}>
                            <Trash2 className="w-5 h-5 mr-2" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl border-blue-100">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-semibold">Delete Appointment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the appointment.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="px-6 py-2">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteAppointment(apt.id)} className="bg-red-500 hover:bg-red-600 px-6 py-2">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </div>
    </TabsContent>

    <TabsContent value="manage-doctors">
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-gray-200 shadow-xl">
          <CardHeader className="px-0 pt-0 pb-8">
            <CardTitle style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px' }}>Add Doctor</CardTitle>
            <CardDescription style={{ fontFamily: 'Inter, sans-serif' }}>Add a new doctor to the system</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form onSubmit={handleAddDoctor} className="space-y-6">
              <div className="space-y-3">
                <Label className="font-medium text-lg">Name</Label>
                <Input name="name" required placeholder="Dr. John Doe" className="h-14 text-lg border-2 border-blue-200 rounded-2xl shadow-md focus:border-blue-500 bg-white/70" />
              </div>
              <div className="space-y-3">
                <Label className="font-medium text-lg">Gender</Label>
                <div className="flex gap-8 p-4 bg-gray-50/50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer text-lg">
                    <input type="radio" name="gender" value="male" defaultChecked className="w-6 h-6 text-blue-600 border-2 border-blue-300" />
                    <span className="font-medium">Male</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-lg">
                    <input type="radio" name="gender" value="female" className="w-6 h-6 text-blue-600 border-2 border-blue-300" />
                    <span className="font-medium">Female</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Specialization</Label>
                  <Input name="specialization" required placeholder="Cardiologist" className="h-14 text-lg border-2 border-blue-200 rounded-2xl shadow-md focus:border-blue-500 bg-white/70" />
                </div>
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Experience</Label>
                  <Input name="experience" required placeholder="10 years" className="h-14 text-lg border-2 border-blue-200 rounded-2xl shadow-md focus:border-blue-500 bg-white/70" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Consultation Fees (₹)</Label>
                  <Input name="fees" type="number" required placeholder="500" defaultValue="500" className="h-14 text-lg border-2 border-blue-200 rounded-2xl shadow-md focus:border-blue-500 bg-white/70" />
                </div>
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Contact</Label>
                  <Input name="contact" required placeholder="+1 234 567 890" className="h-14 text-lg border-2 border-blue-200 rounded-2xl shadow-md focus:border-blue-500 bg-white/70" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-medium text-lg">Availability</Label>
                <Input name="availability" required placeholder="Mon-Fri 9AM-5PM" className="h-14 text-lg border-2 border-blue-200 rounded-2xl shadow-md focus:border-blue-500 bg-white/70" />
              </div>
              <Button type="submit" className="w-full h-16 text-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all font-semibold border-2 border-blue-500">
                Add Doctor
              </Button>
            </form>
          </CardContent>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px' }}>Existing Doctors</CardTitle>
            <CardDescription style={{ fontFamily: 'Inter, sans-serif' }}>List of all doctors</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ScrollArea className="h-[500px]">
              {doctors.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50/50 rounded-2xl p-8">No doctors added yet</div>
              ) : (
                <div className="space-y-5">
                  {doctors.map((doc, idx) => (
                    <div key={doc.id} className="p-6 bg-white/70 rounded-2xl border border-gray-200 flex justify-between items-center hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                      <div>
                        <h4 className="font-bold text-xl text-gray-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          Dr. {doc.name}
                        </h4>
                        <p className="text-lg text-gray-700 mb-1">{doc.specialization}</p>
                        <p className="text-base text-gray-500">{doc.availability}</p>
                      </div>
                      <Button variant="destructive" size="lg" onClick={() => deleteDoctor(doc.id)} className="h-14 px-6 rounded-xl shadow-lg hover:shadow-xl border-2 border-red-200">
                        <Trash2 className="w-5 h-5 mr-2" /> Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </div>
      </div>
    </TabsContent>
  </Tabs>
</TabsContent>

         {/* Blood Bank Management - Enhanced Professional Style (Functionality Preserved) */}
<TabsContent value="bloodbank" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500" data-testid="admin-bloodbank-content">
  <Tabs defaultValue="manage-inventory" className="w-full">
    <TabsList className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 p-2 rounded-2xl border border-red-100 shadow-md w-fit">
      <TabsTrigger value="manage-inventory" className="px-6 py-3 font-medium rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">Manage Inventory</TabsTrigger>
      <TabsTrigger value="blood-requests" className="px-6 py-3 font-medium rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 flex items-center gap-2">
        Blood Requests
        {bloodRequests.filter(r => r.status === 'pending').length > 0 && (
          <Badge className="bg-red-500 text-white text-xs px-2 py-1 font-bold shadow-md border-2 border-white/50">
            {bloodRequests.filter(r => r.status === 'pending').length}
          </Badge>
        )}
      </TabsTrigger>
    </TabsList>

    <TabsContent value="manage-inventory">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Add Blood Record Form */}
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl border border-red-100 shadow-xl">
          <CardHeader className="px-0 pt-0 pb-8">
            <CardTitle style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px' }}>Add Blood Record</CardTitle>
            <CardDescription style={{ fontFamily: 'Inter, sans-serif' }}>Add new blood availability to inventory</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form onSubmit={handleAddBloodBank} className="space-y-6" data-testid="admin-blood-form">
              <div className="space-y-3">
                <Label className="font-medium text-lg">Blood Type</Label>
                <Input name="blood_type" placeholder="e.g., A+, B-, O+" required data-testid="admin-blood-type" className="h-14 text-lg border-2 border-red-200 rounded-2xl shadow-md focus:border-red-500 bg-white/70" />
              </div>
              <div className="space-y-3">
                <Label className="font-medium text-lg">Units Available</Label>
                <Input name="units_available" type="number" min="0" required data-testid="admin-blood-units" className="h-14 text-lg border-2 border-red-200 rounded-2xl shadow-md focus:border-red-500 bg-white/70" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Hospital Name</Label>
                  <Input name="hospital_name" required data-testid="admin-blood-hospital" className="h-14 text-lg border-2 border-red-200 rounded-2xl shadow-md focus:border-red-500 bg-white/70" />
                </div>
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Contact</Label>
                  <Input name="contact" type="tel" required data-testid="admin-blood-contact" className="h-14 text-lg border-2 border-red-200 rounded-2xl shadow-md focus:border-red-500 bg-white/70" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-medium text-lg">Address</Label>
                <Input name="address" required data-testid="admin-blood-address" className="h-14 text-lg border-2 border-red-200 rounded-2xl shadow-md focus:border-red-500 bg-white/70" />
              </div>
              <Button type="submit" className="w-full h-16 text-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all font-semibold border-2 border-red-400" data-testid="admin-add-blood-button">
                ➕ Add Blood Record
              </Button>
            </form>
          </CardContent>
        </div>

        {/* Blood Bank Records List */}
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl border border-red-100 shadow-xl overflow-hidden">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px' }}>Blood Inventory</CardTitle>
            <CardDescription style={{ fontFamily: 'Inter, sans-serif' }}>Current blood bank records</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ScrollArea className="h-[500px]" data-testid="admin-blood-list">
              {bloodBank.length === 0 ? (
                <div className="text-center py-16 bg-red-50/50 rounded-2xl border-2 border-dashed border-red-200 p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="text-5xl mb-4">🩸</div>
                  No blood bank records yet
                </div>
              ) : (
                <div className="space-y-5">
                  {bloodBank.map((record, idx) => (
                    <div key={record.id} className="p-6 bg-white/70 rounded-2xl border border-red-200 shadow-md hover:shadow-xl hover:border-red-300 transition-all duration-300" data-testid={`admin-blood-record-${idx}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-2xl text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            🩸 {record.blood_type}
                          </h4>
                          <p className="text-xl font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {record.hospital_name}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="lg" className="h-12 px-6 rounded-xl shadow-lg hover:shadow-xl border-2 border-red-200" data-testid={`admin-delete-blood-${idx}`}>
                              <Trash2 className="w-5 h-5 mr-2" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl border-red-100">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-semibold">Delete Record?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="px-6 py-2">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteBloodBank(record.id)} className="bg-red-500 hover:bg-red-600 px-6 py-2">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="space-y-3 text-base text-gray-700 p-4 bg-red-50/30 rounded-xl mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <p><span className="font-semibold text-red-600">📞 Contact:</span> {record.contact}</p>
                        <p><span className="font-semibold text-red-600">📍 Address:</span> {record.address}</p>
                      </div>
                      <div className="flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-red-50/30 rounded-2xl">
                        <Input
                          type="number"
                          placeholder="New units"
                          min="0"
                          id={`units-${record.id}`}
                          defaultValue={record.units_available}
                          className="flex-1 h-14 text-lg border-2 border-red-200 rounded-xl shadow-sm focus:border-red-500 bg-white/80"
                          data-testid={`admin-blood-units-input-${idx}`}
                        />
                        <Button
                          size="lg"
                          onClick={() => {
                            const input = document.getElementById(`units-${record.id}`);
                            updateBloodBank(record.id, input.value);
                          }}
                          className="h-14 px-8 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl border-2 border-red-400 font-semibold"
                          data-testid={`admin-update-blood-${idx}`}
                        >
                          Update Units
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="blood-requests">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-red-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-red-100 bg-gradient-to-r from-red-50 to-orange-50">
          <CardTitle className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Blood Requests</CardTitle>
          <CardDescription style={{ fontFamily: 'Inter, sans-serif' }}>Manage blood order requests from users</CardDescription>
        </div>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] p-8">
            {bloodRequests.length === 0 ? (
              <div className="text-center py-20 bg-red-50/50 rounded-3xl border-2 border-dashed border-red-200 p-12" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="text-6xl mb-6">🩸</div>
                No blood requests yet
              </div>
            ) : (
              <div className="space-y-6">
                {bloodRequests.map((req, idx) => (
                  <div key={req.id} className={`p-8 bg-white/80 rounded-3xl border-2 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    req.urgency === 'emergency' ? 'border-red-400 bg-red-50/70 shadow-red-200/50' :
                    req.urgency === 'urgent' ? 'border-yellow-400 bg-yellow-50/70 shadow-yellow-200/50' :
                    'border-gray-200 bg-gray-50/30'
                  }`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h4 className="font-black text-3xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {req.blood_type}
                          </h4>
                          <Badge className={`px-4 py-2 text-lg font-bold shadow-lg border-2 border-white ${
                            req.urgency === 'emergency' ? 'bg-red-500 text-white' :
                            req.urgency === 'urgent' ? 'bg-yellow-500 text-white' :
                            'bg-gray-300 text-gray-800'
                          }`}>
                            {req.urgency.toUpperCase()}
                          </Badge>
                          <Badge className={`${getStatusColor(req.status)} px-4 py-2 text-lg font-bold shadow-lg border-2 border-white`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-lg text-gray-800 p-6 bg-white/50 rounded-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <p><span className="font-semibold text-red-600">Units:</span> {req.units_requested}</p>
                          <p><span className="font-semibold text-red-600">Hospital:</span> {req.hospital_name}</p>
                          <p><span className="font-semibold text-blue-600">Patient:</span> {req.patient_name}</p>
                          <p><span className="font-semibold text-purple-600">Requester:</span> {req.user_name}</p>
                          <p><span className="font-semibold text-orange-600">Email:</span> {req.user_email}</p>
                          <p><span className="font-semibold text-green-600">Phone:</span> {req.user_phone}</p>
                          {req.notes && <p className="col-span-2 mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200"><span className="font-semibold text-yellow-800">Notes:</span> {req.notes}</p>}
                        </div>
                        <p className="text-base text-gray-500 mt-4 font-medium">
                          Requested: {new Date(req.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-4 pt-8 border-t-2 border-red-100 bg-gradient-to-r from-red-50/50 to-orange-50/50 p-6 rounded-2xl">
                        <Button
                          size="lg"
                          onClick={() => updateBloodRequestStatus(req.id, 'approved')}
                          className="flex-1 h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl border-2 border-green-400"
                        >
                          ✅ Approve
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => updateBloodRequestStatus(req.id, 'rejected')}
                          className="flex-1 h-14 border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 font-semibold rounded-xl shadow-lg hover:shadow-xl"
                        >
                          ❌ Reject
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => updateBloodRequestStatus(req.id, 'completed')}
                          className="flex-1 h-14 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-semibold rounded-xl shadow-lg hover:shadow-xl"
                        >
                          ✔️ Completed
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </div>
    </TabsContent>
  </Tabs>
</TabsContent>


         {/* Pharmacy Management - Enhanced Professional Style (Functionality Preserved) */}
<TabsContent value="pharmacies" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500" data-testid="admin-pharmacies-content">
  <Tabs defaultValue="manage-pharmacies" className="w-full">
    <TabsList className="mb-8 bg-gradient-to-r from-amber-50 to-emerald-50 p-2 rounded-2xl border border-amber-100 shadow-md w-fit">
      <TabsTrigger value="manage-pharmacies" className="px-6 py-3 font-medium rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">🏥 Manage Pharmacies</TabsTrigger>
      <TabsTrigger value="manage-medicines" className="px-6 py-3 font-medium rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">💊 Manage Medicines</TabsTrigger>
      <TabsTrigger value="view-orders" className="px-6 py-3 font-medium rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">📦 View Orders</TabsTrigger>
    </TabsList>

    <TabsContent value="manage-pharmacies">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Add Pharmacy Form */}
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl border border-amber-100 shadow-xl">
          <CardHeader className="px-0 pt-0 pb-8">
            <CardTitle style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px' }}>Add Pharmacy</CardTitle>
            <CardDescription style={{ fontFamily: 'Inter, sans-serif' }}>Add a new pharmacy to the network</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form onSubmit={handleAddPharmacy} className="space-y-6" data-testid="admin-pharmacy-form">
              <div className="space-y-3">
                <Label className="font-medium text-lg">Pharmacy Name</Label>
                <Input name="name" required data-testid="admin-pharmacy-name" className="h-14 text-lg border-2 border-amber-200 rounded-2xl shadow-md focus:border-amber-500 bg-white/70" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Location</Label>
                  <Input name="location" placeholder="e.g., Downtown, Near Hospital" required data-testid="admin-pharmacy-location" className="h-14 text-lg border-2 border-amber-200 rounded-2xl shadow-md focus:border-amber-500 bg-white/70" />
                </div>
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Contact</Label>
                  <Input name="contact" type="tel" required data-testid="admin-pharmacy-contact" className="h-14 text-lg border-2 border-amber-200 rounded-2xl shadow-md focus:border-amber-500 bg-white/70" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-medium text-lg">Address</Label>
                <Input name="address" required data-testid="admin-pharmacy-address" className="h-14 text-lg border-2 border-amber-200 rounded-2xl shadow-md focus:border-amber-500 bg-white/70" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Operating Hours</Label>
                  <Input name="operating_hours" placeholder="e.g., 24/7, 9 AM - 9 PM" required data-testid="admin-pharmacy-hours" className="h-14 text-lg border-2 border-amber-200 rounded-2xl shadow-md focus:border-amber-500 bg-white/70" />
                </div>
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Services</Label>
                  <Input name="services" placeholder="e.g., Home Delivery, Online Consultation" required data-testid="admin-pharmacy-services" className="h-14 text-lg border-2 border-amber-200 rounded-2xl shadow-md focus:border-amber-500 bg-white/70" />
                </div>
              </div>
              <Button type="submit" className="w-full h-16 text-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all font-semibold border-2 border-amber-400" data-testid="admin-add-pharmacy-button">
                🏥 Add Pharmacy
              </Button>
            </form>
          </CardContent>
        </div>

        {/* Pharmacy Records List */}
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl border border-amber-100 shadow-xl overflow-hidden">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px' }}>Pharmacy Network</CardTitle>
            <CardDescription style={{ fontFamily: 'Inter, sans-serif' }}>Active pharmacy locations</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ScrollArea className="h-[600px]" data-testid="admin-pharmacy-list">
              {pharmacies.length === 0 ? (
                <div className="text-center py-16 bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-200 p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="text-5xl mb-4">🏥</div>
                  No pharmacy records yet
                </div>
              ) : (
                <div className="space-y-5">
                  {pharmacies.map((pharmacy, idx) => (
                    <div key={pharmacy.id} className="p-6 bg-white/70 rounded-2xl border border-amber-200 shadow-md hover:shadow-xl hover:border-amber-300 transition-all duration-300" data-testid={`admin-pharmacy-card-${idx}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-2xl text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            🏥 {pharmacy.name}
                          </h4>
                          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-lg px-4 py-2 font-semibold shadow-lg">
                            {pharmacy.location}
                          </Badge>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="lg" className="h-12 px-6 rounded-xl shadow-lg hover:shadow-xl border-2 border-red-200" data-testid={`admin-delete-pharmacy-${idx}`}>
                              <Trash2 className="w-5 h-5 mr-2" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl border-amber-100">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-semibold">Delete Pharmacy?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="px-6 py-2">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePharmacy(pharmacy.id)} className="bg-red-500 hover:bg-red-600 px-6 py-2">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="space-y-3 text-base text-gray-700 p-5 bg-amber-50/30 rounded-2xl mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <p><span className="font-semibold text-amber-700">📍 Address:</span> {pharmacy.address}</p>
                        <p><span className="font-semibold text-amber-700">📞 Contact:</span> {pharmacy.contact}</p>
                        <p><span className="font-semibold text-amber-700">🕒 Hours:</span> {pharmacy.operating_hours}</p>
                        <p><span className="font-semibold text-amber-700">🚚 Services:</span> {pharmacy.services}</p>
                      </div>
                      <div className="flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-amber-50/30 rounded-2xl">
                        <Input
                          type="text"
                          placeholder="New contact"
                          id={`contact-${pharmacy.id}`}
                          defaultValue={pharmacy.contact}
                          className="flex-1 h-14 text-lg border-2 border-amber-200 rounded-xl shadow-sm focus:border-amber-500 bg-white/80"
                          data-testid={`admin-pharmacy-contact-input-${idx}`}
                        />
                        <Button
                          size="lg"
                          onClick={() => {
                            const input = document.getElementById(`contact-${pharmacy.id}`);
                            updatePharmacy(pharmacy.id, { contact: input.value });
                          }}
                          className="h-14 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl border-2 border-amber-400 font-semibold"
                          data-testid={`admin-update-pharmacy-${idx}`}
                        >
                          Update Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="manage-medicines">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Add Medicine Form */}
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl border border-emerald-100 shadow-xl">
          <CardHeader className="px-0 pt-0 pb-8">
            <CardTitle style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px' }}>Add Medicine</CardTitle>
            <CardDescription style={{ fontFamily: 'Inter, sans-serif' }}>Add new medicine to pharmacy inventory</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form onSubmit={handleAddMedicine} className="space-y-6">
              <div className="space-y-3">
                <Label className="font-medium text-lg">Medicine Name</Label>
                <Input name="name" required placeholder="Paracetamol" className="h-14 text-lg border-2 border-emerald-200 rounded-2xl shadow-md focus:border-emerald-500 bg-white/70" />
              </div>
              <div className="space-y-3">
                <Label className="font-medium text-lg">Description</Label>
                <Input name="description" required placeholder="Pain reliever" className="h-14 text-lg border-2 border-emerald-200 rounded-2xl shadow-md focus:border-emerald-500 bg-white/70" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Price (₹)</Label>
                  <Input name="price" type="number" step="0.01" required placeholder="10.00" className="h-14 text-lg border-2 border-emerald-200 rounded-2xl shadow-md focus:border-emerald-500 bg-white/70" />
                </div>
                <div className="space-y-3">
                  <Label className="font-medium text-lg">Stock Quantity</Label>
                  <Input name="stock" type="number" required placeholder="100" className="h-14 text-lg border-2 border-emerald-200 rounded-2xl shadow-md focus:border-emerald-500 bg-white/70" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-medium text-lg">Category</Label>
                <Input name="category" required placeholder="General" className="h-14 text-lg border-2 border-emerald-200 rounded-2xl shadow-md focus:border-emerald-500 bg-white/70" />
              </div>
              <Button type="submit" className="w-full h-16 text-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all font-semibold border-2 border-emerald-400">
                💊 Add Medicine
              </Button>
            </form>
          </CardContent>
        </div>

        {/* Medicine Inventory List */}
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl border border-emerald-100 shadow-xl overflow-hidden">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px' }}>Medicine Inventory</CardTitle>
            <CardDescription style={{ fontFamily: 'Inter, sans-serif' }}>Available medicines across pharmacies</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ScrollArea className="h-[500px]">
              {medicines.length === 0 ? (
                <div className="text-center py-16 bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 p-8">
                  <div className="text-5xl mb-4">💊</div>
                  No medicines added yet
                </div>
              ) : (
                <div className="space-y-5">
                  {medicines.map((med, idx) => (
                    <div key={med.id} className="p-6 bg-white/70 rounded-2xl border border-emerald-200 flex justify-between items-center hover:shadow-xl hover:border-emerald-300 transition-all duration-300">
                      <div className="flex-1">
                        <h4 className="font-bold text-2xl text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          💊 {med.name}
                        </h4>
                        <p className="text-lg text-gray-700 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>{med.description}</p>
                        <div className="flex items-center gap-6 p-4 bg-emerald-50 rounded-xl">
                          <div className="text-2xl font-bold text-emerald-600">₹{med.price}</div>
                          <div className="flex items-center gap-2 text-lg">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span className="font-semibold text-green-700">Stock: {med.stock}</span>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 px-3 py-1 font-semibold">{med.category}</Badge>
                        </div>
                      </div>
                      <Button variant="destructive" size="lg" onClick={() => deleteMedicine(med.id)} className="h-14 px-6 rounded-xl shadow-lg hover:shadow-xl border-2 border-red-200">
                        <Trash2 className="w-5 h-5 mr-2" /> Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="view-orders">
  <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-blue-100 shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">

    {/* Header */}
    <div className="p-10 border-b border-blue-200 bg-gradient-to-r from-blue-100/70 via-indigo-100/70 to-purple-100/70">
      <CardTitle
        className="text-3xl font-extrabold text-gray-900 tracking-tight"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        Customer Orders
      </CardTitle>
      <CardDescription
        className="text-lg text-gray-700 mt-1"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Track and manage medicine orders efficiently
      </CardDescription>
    </div>

    <CardContent className="p-0">
      <ScrollArea className="h-[650px] p-10">

        {/* No Orders */}
        {orders.length === 0 ? (
          <div className="text-center py-24 bg-blue-50/50 rounded-3xl border-2 border-dashed border-blue-300 p-12 shadow-inner">
            <div className="text-7xl mb-6">📦</div>
            <p className="text-2xl font-semibold text-gray-600">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-10">

            {/* Order Card */}
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-10 bg-gradient-to-br from-white/80 to-blue-50/50 rounded-3xl border border-blue-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
              >

                {/* Header: Order ID + Badge */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <h4
                      className="font-black text-4xl bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent"
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                    >
                      Order #{order.id.slice(0, 8)}
                    </h4>

                    <Badge
                      className={`
                        px-6 py-3 rounded-2xl text-xl font-bold shadow-md border border-white/50
                        ${
                          order.status === 'completed' || order.status === 'delivered'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : order.status === 'shipped'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                            : order.status === 'processing'
                            ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                            : order.status === 'pending'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                        }
                      `}
                    >
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Customer Info */}
                <div
                  className="grid grid-cols-2 gap-x-14 gap-y-6 text-xl text-gray-800
                             p-8 bg-white/80 backdrop-blur-md rounded-2xl border border-blue-200 shadow-inner"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <p>
                    <span className="font-semibold text-blue-700">Customer:</span> {order.user_name}
                  </p>
                  <p>
                    <span className="font-semibold text-blue-700">Order Date:</span>{' '}
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Order Items */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl p-8 mt-10 border border-emerald-200 shadow-lg">
                  <h5 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    🛒 Order Items
                  </h5>

                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-5 bg-white/80 rounded-2xl border hover:bg-white hover:shadow-xl transition-all duration-300"
                      >
                        <span className="text-xl font-medium text-gray-700">
                          {item.medicine_name} × {item.quantity}
                        </span>
                        <span className="text-3xl font-extrabold text-emerald-600">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="pt-5 border-t-2 border-gray-300 flex justify-between items-center bg-white/90 p-6 rounded-2xl shadow-md mt-6">
                      <span className="text-3xl font-black text-gray-900">Total</span>
                      <span className="text-4xl font-black bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                        ₹{order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Update Status */}
                <div className="flex gap-5 pt-10 border-t-2 border-blue-200 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 mt-12 p-6 rounded-2xl shadow-inner">

                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="flex-1 h-16 text-xl bg-white/80 border-2 border-blue-300 rounded-2xl shadow-md hover:border-blue-500 font-semibold">
                      <SelectValue placeholder="Update Order Status" />
                    </SelectTrigger>

                    <SelectContent className="border-2 border-blue-200 rounded-2xl shadow-xl text-lg">
                      <SelectItem value="pending">⏳ Pending</SelectItem>
                      <SelectItem value="processing">⚙️ Processing</SelectItem>
                      <SelectItem value="shipped">🚚 Shipped</SelectItem>
                      <SelectItem value="delivered">📦 Delivered</SelectItem>
                      <SelectItem value="completed">✅ Completed</SelectItem>
                      <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                </div>

              </div>
            ))}

          </div>
        )}
      </ScrollArea>
    </CardContent>
  </div>
</TabsContent>

        
  </Tabs>
</TabsContent>

        </Tabs>
      </main>
    </div>
  );
}