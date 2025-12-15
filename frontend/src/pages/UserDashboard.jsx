import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Calendar, Droplet, MessageSquare, LogOut, Send, User, Image as ImageIcon, X, ShoppingCart, Plus, Minus, Pill, ArrowLeft, Activity, Bot, UserPlus, Clock, Upload } from 'lucide-react';
import DoctorCard from '@/components/DoctorCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function UserDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bloodBank, setBloodBank] = useState([]);
  const [searchBlood, setSearchBlood] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [searchPharmacy, setSearchPharmacy] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [bloodRequests, setBloodRequests] = useState([]);
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [myOrders, setMyOrders] = useState([]);

  const fileInputRef = useRef(null);

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
      fetchMyOrders();
    }
  }, [activeTab]);

  // Fetch booked slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchBookedSlots();
    } else {
      setBookedSlots([]);
    }
  }, [selectedDoctor, selectedDate]);

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
      console.error('Failed to load blood requests:', error);
    }
  };

  const handleBloodRequest = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (!selectedBloodType) {
      toast.error('Please select a blood type');
      return;
    }

    try {
      await axios.post(`${API}/blood-requests`, {
        blood_type: selectedBloodType,
        units_requested: parseInt(formData.get('units')),
        hospital_name: formData.get('hospital'),
        patient_name: formData.get('patient_name'),
        urgency: formData.get('urgency') || 'normal',
        notes: formData.get('notes') || null
      });
      toast.success('Blood request submitted successfully!');
      e.target.reset();
      setSelectedBloodType('');
      setSelectedHospital('');
      fetchBloodRequests();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit blood request');
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

  const fetchMyOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setMyOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const response = await axios.get(`${API}/appointments/booked-slots`, {
        params: {
          doctor_name: selectedDoctor,
          appointment_date: selectedDate
        }
      });
      setBookedSlots(response.data);
    } catch (error) {
      console.error('Failed to load booked slots:', error);
      setBookedSlots([]);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() && !selectedImage) return;

    const userMessage = {
      role: 'user',
      content: chatInput,
      image: selectedImage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setSelectedImageName(null);
    setIsChatLoading(true);

    try {
      const response = await axios.post(`${API}/chat/message`, {
        message: chatInput,
        image: currentImage,
        session_id: sessionId,
      });

      const botMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, botMessage]);
      setSessionId(response.data.session_id);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to send message';
      toast.error(errorMessage);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    sendChatMessage();
  };

  const handleRequestAppointment = (doctor) => {
    setSelectedDoctorForBooking(doctor);
    setSelectedDoctor(doctor.name);
    setShowBookingForm(true);
  };

  const handleBackToDoctorList = () => {
    setShowBookingForm(false);
    setSelectedDoctorForBooking(null);
    setSelectedDoctor('');
    setSelectedDate('');
    setBookedSlots([]);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    // If using the new form where we might not have a form element with name attributes in the same way,
    // we need to adapt. But let's assume we use controlled inputs or refs if needed.
    // However, the new UI uses controlled inputs for date and doctor, but maybe not for reason/phone etc.
    // Let's stick to the FormData approach if the form has name attributes, OR update to state.

    // The new UI I designed uses:
    // selectedDoctorForBooking (state)
    // selectedDate (state)
    // But it doesn't have inputs for patient name/email/phone/reason in the new snippet I wrote.
    // I need to add those back to the new UI or use the old form logic.
    // The new UI snippet I wrote was a bit simplified. I should add the missing fields.

    const formData = new FormData(e.target);
    const appointmentData = {
      patient_name: formData.get('patient_name') || user.name,
      patient_email: formData.get('patient_email') || user.email,
      patient_phone: formData.get('patient_phone') || user.phone,
      doctor_name: selectedDoctorForBooking?.name || selectedDoctor,
      appointment_date: selectedDate, // Use state
      appointment_time: formData.get('appointment_time') || '10:00', // Default or add input
      reason: formData.get('reason') || 'Checkup', // Default or add input
    };

    try {
      await axios.post(`${API}/appointments`, appointmentData);
      toast.success('Appointment booked successfully!');
      if (e.target.reset) e.target.reset();
      handleBackToDoctorList();
      fetchAppointments();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to book appointment';
      toast.error(errorMessage, { duration: 5000 });
    }
  };

  const addToCart = (medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
    toast.success('Added to cart');
  };

  const removeFromCart = (medicineId) => {
    setCart(prev => prev.filter(item => item.id !== medicineId));
  };

  const updateQuantity = (medicineId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === medicineId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

    const orderData = {
      items: cart.map(item => ({
        medicine_id: item.id,
        medicine_name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total_amount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    try {
      await axios.post(`${API}/orders`, orderData);
      toast.success('Order placed successfully!');
      setCart([]);
      fetchMyOrders();
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  const specializations = [...new Set(doctors.map(d => d.specialization))];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#2FAF8A]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#235A87]/20 blur-[120px]" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-[#D7A037]/20 blur-[100px]" />
      </div>
      <header className="backdrop-blur-xl bg-white/80 sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="logo-container">
              <svg className="ecg-svg" viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
                <path className="ecg-line" d="M0 25 L55 25 L65 5 L75 45 L85 25 L150 25" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Health<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#235A87] to-[#2FAF8A]">Care</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-xl">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 perspective-1000">
        {/* Home View - 2x2 Feature Cards + Info Cards Below */}
        {!activeTab && (
          <div className="flex flex-col items-center gap-12 py-8">
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 tracking-wide" style={{ fontFamily: 'Manrope, sans-serif' }}>
              INTEGRATED HEALTHCARE PLATFORM
            </h1>

            {/* 2x2 Feature Cards Grid - With descriptions */}
<div 
  className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-10 max-w-7xl w-full px-8 py-12 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
  style={{ 
    perspective: '1600px',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch'
  }}
>
  {/* Blood Bank Card */}
  <div
    onClick={() => setActiveTab('bloodbank')}
    className="snap-center snap-always flex-shrink-0 w-[380px] h-[420px] cursor-pointer p-12 rounded-[3rem] bg-gradient-to-br from-[#E07A6A] via-[#D44A3A]/90 to-[#B8322E] shadow-[0_35px_60px_rgba(224,122,106,0.4)] transition-all duration-700 ease-out hover:scale-115 hover:rotate-y-8 hover:rotate-x-4 hover:shadow-[0_45px_80px_rgba(224,122,106,0.6),inset_0_0_30px_rgba(255,255,255,0.25)] hover:z-10 relative overflow-hidden"
    style={{ 
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden'
    }}
  >
    {/* Dynamic shine effect */}
    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-white/40 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 -skew-x-12 -translate-x-1/2" />
    {/* Border glow */}
    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-[#E07A6A]/50 to-[#D44A3A]/50 opacity-75 blur-xl scale-105 animate-pulse" />
    
    <div className="flex flex-col h-full text-white relative z-20">
      <div className="flex items-center gap-6 mb-8">
        <div className="p-5 bg-white/25 backdrop-blur-sm rounded-2xl shadow-xl hover:bg-white/40 transition-all duration-300 border border-white/30">
          <Droplet className="w-9 h-9 drop-shadow-2xl" />
        </div>
        <div>
          <h3 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">Blood Bank</h3>
          <div className="w-24 h-1 bg-gradient-to-r from-white/60 to-transparent rounded-full mt-2" />
        </div>
      </div>
      <p className="text-xl opacity-95 leading-relaxed flex-1 font-medium drop-shadow-md">
        Comprehensive blood bank services to search availability, request blood units in emergencies, and connect with nearby donors for life-saving support.
      </p>
    </div>
  </div>

  {/* Appointments Card */}
  <div
    onClick={() => setActiveTab('appointments')}
    className="snap-center snap-always flex-shrink-0 w-[380px] h-[420px] cursor-pointer p-12 rounded-[3rem] bg-gradient-to-br from-[#3BB896] via-[#2FAF8A]/90 to-[#1F8B6A] shadow-[0_35px_60px_rgba(59,184,150,0.4)] transition-all duration-700 ease-out hover:scale-115 hover:rotate-y-8 hover:rotate-x-4 hover:shadow-[0_45px_80px_rgba(59,184,150,0.6),inset_0_0_30px_rgba(255,255,255,0.25)] hover:z-10 relative overflow-hidden"
    style={{ 
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden'
    }}
  >
    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-white/40 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 -skew-x-12 -translate-x-1/2" />
    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-[#3BB896]/50 to-[#2FAF8A]/50 opacity-75 blur-xl scale-105 animate-pulse" />
    
    <div className="flex flex-col h-full text-white relative z-20">
      <div className="flex items-center gap-6 mb-8">
        <div className="p-5 bg-white/25 backdrop-blur-sm rounded-2xl shadow-xl hover:bg-white/40 transition-all duration-300 border border-white/30">
          <Calendar className="w-9 h-9 drop-shadow-2xl" />
        </div>
        <div>
          <h3 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">Doctor Appointment</h3>
          <div className="w-24 h-1 bg-gradient-to-r from-white/60 to-transparent rounded-full mt-2" />
        </div>
      </div>
      <p className="text-xl opacity-95 leading-relaxed flex-1 font-medium drop-shadow-md">
        Book appointments with qualified healthcare professionals across specializations, view doctor profiles, and manage your healthcare schedule efficiently.
      </p>
    </div>
  </div>

  {/* AI Chatbot Card */}
  <div
    onClick={() => setActiveTab('chatbot')}
    className="snap-center snap-always flex-shrink-0 w-[380px] h-[420px] cursor-pointer p-12 rounded-[3rem] bg-gradient-to-br from-[#3A6B8A] via-[#235A87]/90 to-[#1A3F5F] shadow-[0_35px_60px_rgba(58,107,138,0.4)] transition-all duration-700 ease-out hover:scale-115 hover:rotate-y-8 hover:rotate-x-4 hover:shadow-[0_45px_80px_rgba(58,107,138,0.6),inset_0_0_30px_rgba(255,255,255,0.25)] hover:z-10 relative overflow-hidden"
    style={{ 
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden'
    }}
  >
    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-white/40 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 -skew-x-12 -translate-x-1/2" />
    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-[#3A6B8A]/50 to-[#235A87]/50 opacity-75 blur-xl scale-105 animate-pulse" />
    
    <div className="flex flex-col h-full text-white relative z-20">
      <div className="flex items-center gap-6 mb-8">
        <div className="p-5 bg-white/25 backdrop-blur-sm rounded-2xl shadow-xl hover:bg-white/40 transition-all duration-300 border border-white/30">
          <MessageSquare className="w-9 h-9 drop-shadow-2xl" />
        </div>
        <div>
          <h3 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">AI Health Chatbot</h3>
          <div className="w-24 h-1 bg-gradient-to-r from-white/60 to-transparent rounded-full mt-2" />
        </div>
      </div>
      <p className="text-xl opacity-95 leading-relaxed flex-1 font-medium drop-shadow-md">
        Get instant health guidance 24/7 with our AI-powered assistant. Analyze symptoms, upload medical images, and receive personalized health recommendations.
      </p>
    </div>
  </div>

  {/* Pharmacy Card */}
  <div
    onClick={() => setActiveTab('pharmacies')}
    className="snap-center snap-always flex-shrink-0 w-[380px] h-[420px] cursor-pointer p-12 rounded-[3rem] bg-gradient-to-br from-[#E0A840] via-[#D7A037]/90 to-[#B8860B] shadow-[0_35px_60px_rgba(224,168,64,0.4)] transition-all duration-700 ease-out hover:scale-115 hover:rotate-y-8 hover:rotate-x-4 hover:shadow-[0_45px_80px_rgba(224,168,64,0.6),inset_0_0_30px_rgba(255,255,255,0.25)] hover:z-10 relative overflow-hidden"
    style={{ 
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden'
    }}
  >
    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-white/40 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 -skew-x-12 -translate-x-1/2" />
    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-[#E0A840]/50 to-[#D7A037]/50 opacity-75 blur-xl scale-105 animate-pulse" />
    
    <div className="flex flex-col h-full text-white relative z-20">
      <div className="flex items-center gap-6 mb-8">
        <div className="p-5 bg-white/25 backdrop-blur-sm rounded-2xl shadow-xl hover:bg-white/40 transition-all duration-300 border border-white/30">
          <Pill className="w-9 h-9 drop-shadow-2xl" />
        </div>
        <div>
          <h3 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">Pharmacy</h3>
          <div className="w-24 h-1 bg-gradient-to-r from-white/60 to-transparent rounded-full mt-2" />
        </div>
      </div>
      <p className="text-xl opacity-95 leading-relaxed flex-1 font-medium drop-shadow-md">
        Order medicines online and get them delivered to your doorstep. Browse our catalog, compare prices, and track your orders in real-time.
      </p>
    </div>
  </div>
</div>

{/* Information Cards - Enhanced Styling */}
<div className="flex flex-col gap-8 w-full max-w-7xl px-6 py-8">
  {/* Blood Bank Info Card */}
  <div className="group bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:bg-red-50/50">
    <div className="flex items-center mb-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mr-6 shadow-2xl group-hover:scale-110 transition-all duration-300 ring-4 ring-red-100/50 group-hover:ring-red-200/70" style={{ background: 'linear-gradient(135deg, #D44A3A, #E07A6A)' }}>
        <Droplet className="w-8 h-8 text-white drop-shadow-lg" />
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors" style={{ fontFamily: 'Manrope, sans-serif' }}>Blood Bank Management</h3>
        <p className="text-base font-semibold text-gray-600 bg-red-100/60 px-3 py-1 rounded-lg inline-block group-hover:bg-red-200/70 transition-all">Life-saving resources at your fingertips</p>
      </div>
    </div>
    <p className="text-gray-700 leading-relaxed mb-6 text-lg font-medium">
      Our comprehensive blood bank system allows you to search for blood availability in real-time across multiple hospitals and blood banks in your area.
    </p>
    <ul className="space-y-3 text-gray-700">
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #D44A3A, #E07A6A)' }} />
        Real-time blood availability tracking across 100+ centers
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-75 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #D44A3A, #E07A6A)' }} />
        Emergency blood request notifications to nearby donors
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-150 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #D44A3A, #E07A6A)' }} />
        Blood donation scheduling and reminder system
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-225 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #D44A3A, #E07A6A)' }} />
        View hospital contact information and directions
      </li>
    </ul>
  </div>

  {/* Doctor Appointment Info Card */}
  <div className="group bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:bg-emerald-50/50">
    <div className="flex items-center mb-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mr-6 shadow-2xl group-hover:scale-110 transition-all duration-300 ring-4 ring-emerald-100/50 group-hover:ring-emerald-200/70" style={{ background: 'linear-gradient(135deg, #2FAF8A, #3BB896)' }}>
        <Calendar className="w-8 h-8 text-white drop-shadow-lg" />
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors" style={{ fontFamily: 'Manrope, sans-serif' }}>Doctor Appointment</h3>
        <p className="text-base font-semibold text-gray-600 bg-emerald-100/60 px-3 py-1 rounded-lg inline-block group-hover:bg-emerald-200/70 transition-all">Connect with healthcare professionals</p>
      </div>
    </div>
    <p className="text-gray-700 leading-relaxed mb-6 text-lg font-medium">
      Book appointments with qualified doctors across various specializations with smart scheduling.
    </p>
    <ul className="space-y-3 text-gray-700">
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #2FAF8A, #3BB896)' }} />
        View doctor profiles, specializations, and patient reviews
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-75 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #2FAF8A, #3BB896)' }} />
        Smart time slot suggestions based on your schedule
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-150 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #2FAF8A, #3BB896)' }} />
        Automated appointment reminders via SMS and email
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-225 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #2FAF8A, #3BB896)' }} />
        Track your appointment history and upcoming visits
      </li>
    </ul>
  </div>

  {/* AI Chatbot Info Card */}
  <div className="group bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:bg-blue-50/50">
    <div className="flex items-center mb-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mr-6 shadow-2xl group-hover:scale-110 transition-all duration-300 ring-4 ring-blue-100/50 group-hover:ring-blue-200/70" style={{ background: 'linear-gradient(135deg, #235A87, #3A6B8A)' }}>
        <MessageSquare className="w-8 h-8 text-white drop-shadow-lg" />
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors" style={{ fontFamily: 'Manrope, sans-serif' }}>AI Health Chatbot</h3>
        <p className="text-base font-semibold text-gray-600 bg-blue-100/60 px-3 py-1 rounded-lg inline-block group-hover:bg-blue-200/70 transition-all">24/7 intelligent health assistance</p>
      </div>
    </div>
    <p className="text-gray-700 leading-relaxed mb-6 text-lg font-medium">
      Get instant answers to your health questions 24/7 with our AI-powered medical assistant.
    </p>
    <ul className="space-y-3 text-gray-700">
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #235A87, #3A6B8A)' }} />
        Symptom checker with preliminary health assessment
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-75 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #235A87, #3A6B8A)' }} />
        Upload medical images for AI-powered analysis
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-150 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #235A87, #3A6B8A)' }} />
        Medication information and interaction warnings
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-225 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #235A87, #3A6B8A)' }} />
        Health tips personalized to your medical history
      </li>
    </ul>
  </div>

  {/* Pharmacy Info Card */}
  <div className="group bg-white/90 backdrop-blur-xl p-10 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:bg-amber-50/50">
    <div className="flex items-center mb-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mr-6 shadow-2xl group-hover:scale-110 transition-all duration-300 ring-4 ring-amber-100/50 group-hover:ring-amber-200/70" style={{ background: 'linear-gradient(135deg, #D7A037, #E0A840)' }}>
        <Pill className="w-8 h-8 text-white drop-shadow-lg" />
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors" style={{ fontFamily: 'Manrope, sans-serif' }}>Pharmacy Services</h3>
        <p className="text-base font-semibold text-gray-600 bg-amber-100/60 px-3 py-1 rounded-lg inline-block group-hover:bg-amber-200/70 transition-all">Medicines delivered to your doorstep</p>
      </div>
    </div>
    <p className="text-gray-700 leading-relaxed mb-6 text-lg font-medium">
      Order medicines online and get them delivered to your doorstep with secure payment options.
    </p>
    <ul className="space-y-3 text-gray-700">
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #D7A037, #E0A840)' }} />
        Browse extensive catalog of medicines and health products
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-75 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #D7A037, #E0A840)' }} />
        Compare medicine prices across different brands
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-150 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #D7A037, #E0A840)' }} />
        Easy cart management and secure checkout
      </li>
      <li className="flex items-start group-hover:translate-x-2 transition-all duration-300 delay-225 text-base font-medium">
        <span className="w-3 h-3 rounded-full mt-2.5 mr-4 flex-shrink-0 shadow-md group-hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #D7A037, #E0A840)' }} />
        Track your orders and delivery status in real-time
      </li>
    </ul>
  </div>
</div>
</div>)}

        {/* Section Pages with Back Button */}
        {activeTab && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setActiveTab(null)}
              className="mb-6 hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        )}

        <Tabs value={activeTab || 'chatbot'} className="w-full space-y-8">
  {activeTab === 'chatbot' && (
    <div className="relative card-3d bg-white/90 backdrop-blur-2xl rounded-3xl border border-gray-200 shadow-2xl shadow-blue-200/40 overflow-hidden h-[650px] flex flex-col">

      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-[#e8f1f8] via-white to-[#e9f7f3] backdrop-blur-xl flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#235A87] to-[#2FAF8A] shadow-lg shadow-blue-300/40">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 tracking-tight">AI Health Assistant</h3>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online • Ready to help
            </p>
          </div>
        </div>
      </div>

      {/* Chat Scroll */}
      <ScrollArea className="flex-1 p-5 space-y-4 bg-gradient-to-b from-white/70 to-blue-50/40">

        {/* Welcome Screen */}
        {chatMessages.length === 0 && !isChatLoading && (
          <div className="flex flex-col items-center justify-center h-full py-8">

            {/* Icon */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#235A87] to-[#2FAF8A] flex items-center justify-center mb-6 shadow-xl shadow-blue-300/40">
              <Bot className="w-12 h-12 text-white" />
            </div>

            <h2
              className="text-3xl font-extrabold text-gray-800 mb-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              AI Health Assistant
            </h2>

            <p className="text-gray-500 text-center max-w-lg mb-8 px-4 text-sm">
              I can help with symptom understanding, medical insights, and guidance.  
              I’m helpful but not a replacement for a doctor.
            </p>

            {/* Suggestion Quick Actions */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg px-4">
              {[
                "Can you give me some medical advice?",
                "Give me information about clinical guidelines",
                "I want to learn more about my symptoms",
                "Analyze my medical image for issues"
              ].map((txt, i) => (
                <button
                  key={i}
                  onClick={() => setChatInput(txt)}
                  className="p-4 text-left bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#235A87] group"
                >
                  <span className="text-sm text-gray-700 group-hover:text-[#235A87]">{txt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-md transition-all animate-fadeIn 
                ${msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-lg shadow-blue-300/40'
                  : 'bg-white/90 backdrop-blur-md text-gray-800 border border-gray-100 rounded-bl-none'}
              `}
            >
              <div className={`prose ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'} max-w-none text-sm`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>

              {msg.image && (
                <img
                  src={msg.image}
                  alt="User Upload"
                  className="mt-3 max-w-full h-auto rounded-xl border border-white/30 shadow-md"
                />
              )}
            </div>
          </div>
        ))}

        {/* Typing Bubble */}
        {isChatLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white/90 border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-150" />
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-300" />
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-inner">
        <form onSubmit={handleChatSubmit} className="flex gap-3">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask your health question..."
            className="flex-1 rounded-xl border-gray-300 bg-white/80 focus:ring-2 focus:ring-cyan-500 shadow-sm"
            disabled={isChatLoading}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl hover:bg-gray-100"
          >
            <Upload className="w-4 h-4 text-gray-600" />
          </Button>

          <Button
            type="submit"
            className="bg-gradient-to-r from-[#235A87] to-[#2FAF8A] hover:from-[#1d456d] hover:to-[#259c78] text-white rounded-xl shadow-lg shadow-blue-300/40 hover:scale-105 transition-all"
            disabled={isChatLoading || (!chatInput.trim() && !selectedImage)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* Selected Image */}
        {selectedImage && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-inner">
            <ImageIcon className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{selectedImageName}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 w-6 p-0 hover:bg-gray-200 rounded-full"
              onClick={() => { setSelectedImage(null); setSelectedImageName(null); }}
            >
              ×
            </Button>
          </div>
        )}
      </div>
    </div>
  )}



         {activeTab === 'appointments' && (
  <div className="grid md:grid-cols-2 gap-10 px-6 py-8">
    {/* Book Appointment Card */}
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-white/95 to-emerald-50/80 backdrop-blur-2xl p-8 rounded-3xl border border-emerald-100/50 shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-xl -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-300/10 to-transparent rounded-full blur-xl translate-y-12 -translate-x-12" />
        
        <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-gray-900 relative z-10" style={{ fontFamily: 'Manrope, sans-serif' }}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2FAF8A] to-[#3BB896] flex items-center justify-center shadow-2xl ring-4 ring-white/30 drop-shadow-lg">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          Book Appointment
        </h2>
        
        <div className="space-y-6 relative z-10">
          {/* Specialization Selector */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm">🎯</span>
              Select Specialization
            </Label>
            <Select onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="rounded-2xl border-emerald-200/50 bg-white/80 shadow-lg hover:shadow-emerald-200/50 hover:border-emerald-300/70 transition-all duration-300 h-14 text-lg">
                <SelectValue placeholder="Choose specialization..." />
              </SelectTrigger>
              <SelectContent className="rounded-3xl border-emerald-200/30 bg-white/95 backdrop-blur-xl shadow-2xl border-opacity-50">
                {specializations.map(spec => (
                  <SelectItem key={spec} value={spec} className="hover:bg-emerald-50/70 text-lg py-3">
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor Selector */}
          {selectedSpecialization && (
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm">👨‍⚕️</span>
                Select Doctor
              </Label>
              <div className="grid gap-4 max-h-[340px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-emerald-300/60 scrollbar-track-emerald-50/30 rounded-2xl">
                {doctors
                  .filter(d => d.specialization === selectedSpecialization)
                  .map(doctor => (
                    <div
                      key={doctor.id}
                      onClick={() => {
                        setSelectedDoctorForBooking(doctor);
                        setSelectedDoctor(doctor.name);
                      }}
                      className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-400 flex items-center gap-5 hover:shadow-xl hover:shadow-emerald-200/40 hover:-translate-y-1 hover:scale-[1.015] hover:border-emerald-400/70 backdrop-blur-sm ${
                        selectedDoctorForBooking?.id === doctor.id
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-50/90 to-emerald-100/70 shadow-2xl shadow-emerald-300/40 ring-4 ring-emerald-200/60 scale-[1.02] border-opacity-100'
                          : 'border-gray-200/60 bg-white/80 hover:bg-emerald-50/40'
                      }`}
                    >
                      {/* Enhanced Doctor Avatar */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100/80 to-gray-200/60 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-white/50 group-hover:ring-emerald-200/50 transition-all duration-300">
                        {doctor.gender === 'female' ? (
                          <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 drop-shadow-md">
                            <rcle cx="32" cy="32" r="32" fill="#E8F4F8" />
                            <ellipse cx="32" cy="25" rx="11" ry="12" fill="#F5D0C5" />
                            <path d="M21 22C21 22 23 12 32 12C41 12 43 22 43 22" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" />
                            <path d="M19 25C19 25 17 16 32 14C47 16 45 25 45 25" fill="#3E2723" />
                            <rcle cx="27" cy="25" r="1.5" fill="#333" />
                            <rcle cx="37" cy="25" r="1.5" fill="#333" />
                            <path d="M30 32C30 32 32 35 34 32" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />
                            <path d="M16 44C16 44 18 37 32 37C46 37 48 44 48 44L48 64L16 64L16 44Z" fill="#4FC3F7" />
                            <path d="M32 37L32 44" stroke="white" strokeWidth="2.5" />
                            <rcle cx="32" cy="46" r="1.5" fill="white" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 drop-shadow-md">
                            <rcle cx="32" cy="32" r="32" fill="#E8F4F8" />
                            <ellipse cx="32" cy="25" rx="11" ry="12" fill="#D7A67E" />
                            <path d="M22 19C22 19 24 13 32 13C40 13 42 19 42 19L42 22L22 22L22 19Z" fill="#2C2C2C" />
                            <rcle cx="27" cy="25" r="1.5" fill="#333" />
                            <rcle cx="37" cy="25" r="1.5" fill="#333" />
                            <path d="M30 32C30 32 32 35 34 32" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />
                            <path d="M16 44C16 44 18 37 32 37C46 37 48 44 48 44L48 64L16 64L16 44Z" fill="#4FC3F7" />
                            <path d="M32 37L32 44" stroke="white" strokeWidth="2.5" />
                            <rcle cx="32" cy="46" r="1.5" fill="white" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Doctor Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg text-gray-900 group-hover:text-emerald-800 transition-colors">{doctor.name}</div>
                        <div className="text-sm font-semibold text-emerald-700 mt-0.5 bg-emerald-100/60 px-2 py-0.5 rounded-full inline-block">{doctor.specialization}</div>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="text-gray-500">{doctor.experience}</span>
                          <span className="text-lg font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg">₹{doctor.fees || 500}</span>
                        </div>
                      </div>
                      
                      {/* Selection Arrow */}
                      <div className={`text-2xl transition-all ${selectedDoctorForBooking?.id === doctor.id ? 'text-emerald-500 rotate-0' : 'text-gray-300 group-hover:text-emerald-400 -rotate-12 group-hover:rotate-0'}`}>
                        →
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Booking Form */}
          {selectedDoctorForBooking && (
            <form onSubmit={handleBookAppointment} className="space-y-5 animate-in fade-in-50 slide-in-from-top-2">
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm">📅</span>
                  Select Date
                </Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-2xl border-emerald-200/50 bg-white/80 shadow-lg hover:shadow-emerald-200/50 h-14 text-lg font-medium"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm">🕒</span>
                  Time
                </Label>
                <Input
                  name="appointment_time"
                  type="time"
                  className="rounded-2xl border-emerald-200/50 bg-white/80 shadow-lg hover:shadow-emerald-200/50 h-14 text-lg font-medium"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm">📝</span>
                  Reason
                </Label>
                <Input
                  name="reason"
                  placeholder="Reason for your visit..."
                  className="rounded-2xl border-emerald-200/50 bg-white/80 shadow-lg hover:shadow-emerald-200/50 h-14 text-lg font-medium"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-16 bg-gradient-to-r from-[#2FAF8A] via-[#2FAF8A]/90 to-[#235A87] hover:from-[#259c78] hover:to-[#1a4a6f] text-xl font-bold text-white rounded-2xl shadow-xl hover:shadow-emerald-500/40 transition-all duration-400 transform hover:-translate-y-1 active:scale-[0.98] ring-4 ring-emerald-200/50"
              >
                ✅ Confirm Booking
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>

    {/* Appointments List Card */}
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-white/90 to-slate-50/80 backdrop-blur-2xl p-8 rounded-3xl border border-slate-100/50 shadow-2xl hover:shadow-slate-300/20 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-xl" />
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-purple-300/10 to-transparent rounded-full blur-xl" />
        
        <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-gray-900 relative z-10" style={{ fontFamily: 'Manrope, sans-serif' }}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-2xl ring-4 ring-white/30 drop-shadow-lg">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          Your Appointments
        </h2>
        
        <ScrollArea className="h-[520px] pr-4 rounded-2xl">
          <div className="space-y-4">
            {appointments.map(apt => (
              <div key={apt.id} className="group/appointment p-6 rounded-2xl border border-gray-100/50 bg-white/70 backdrop-blur-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-400 hover:border-slate-200/70">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-gray-900 mb-1 truncate group-hover/appointment:text-slate-800">{apt.doctor_name}</h3>
                    <p className="text-sm font-semibold text-slate-600 mb-2">{apt.specialization}</p>
                    <div className="flex items-center gap-3 text-sm bg-slate-50/60 px-4 py-2 rounded-xl">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-md transform transition-all duration-300 ${
                    apt.status === 'confirmed' 
                      ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 shadow-emerald-200/50 hover:scale-105' 
                      : apt.status === 'pending' 
                      ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 shadow-amber-200/50 hover:scale-105'
                      : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 shadow-red-200/50 hover:scale-105'
                  }`}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 bg-gradient-to-r from-slate-50 to-slate-100/50 p-3 rounded-xl backdrop-blur-sm border border-slate-100/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-800">{apt.appointment_time || '10:00 AM'}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs bg-slate-200 px-2 py-1 rounded-full font-medium">₹{apt.fees || 500}</span>
                  </div>
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="text-center py-16 text-gray-500 space-y-4">
                <Calendar className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No appointments scheduled</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">Book your first appointment with our trusted doctors and get personalized healthcare.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  </div>
)}

        {activeTab === 'bloodbank' && (
  <div className="flex flex-col lg:flex-row gap-8 w-full px-6">
    
    {/* Left Panel - Blood Availability */}
    <div className="flex-1">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-gray-200 shadow-lg w-full h-full">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-[#D44A3A] rounded-3xl flex items-center justify-center mr-4 shadow-md">
            <Droplet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>Blood Bank</h2>
            <p className="text-gray-600 text-sm">Check real-time blood availability</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <Input
            placeholder="Search by blood type or hospital..."
            value={searchBlood}
            onChange={(e) => setSearchBlood(e.target.value)}
            className="w-full h-12 rounded-xl border-gray-300 bg-white shadow-sm focus:border-[#D44A3A] focus:ring-2 focus:ring-[#D44A3A]/20 transition-all"
          />
        </div>

        {/* Blood Cards */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bloodBank.filter(record =>
            record.blood_type.toLowerCase().includes(searchBlood.toLowerCase()) ||
            record.hospital_name.toLowerCase().includes(searchBlood.toLowerCase())
          ).map(item => (
            <div key={item.id} className="flex flex-col justify-between p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-xl transition-all duration-200 hover:-translate-y-1 h-full">
              
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{item.blood_type}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Blood Group</div>
                <div className="text-sm text-gray-500 mb-2">{item.hospital_name}</div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className={`text-2xl font-bold ${item.units_available > 5 ? 'text-green-600' : 'text-orange-600'}`}>
                  {item.units_available} Units
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => {
                  setSelectedBloodType(item.blood_type);
                  setSelectedHospital(item.hospital_name);
                }}
                className={`w-full h-12 rounded-xl font-medium transition-colors ${item.units_available === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#D44A3A] hover:bg-[#c04030] text-white'}`}
                disabled={item.units_available === 0}
              >
                {item.units_available > 0 ? 'Request Blood' : 'Out of Stock'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right Panel - Request Form & My Requests */}
    <div className="flex-1 flex flex-col gap-6">
      
      {/* Request Form */}
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-gray-200 shadow-lg w-full">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900 border-b border-gray-100 pb-4">
          <Plus className="w-5 h-5 text-[#D44A3A]" />
          Request Blood
        </h3>
        <form onSubmit={handleBloodRequest} className="space-y-4">
          {/* Form Fields */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Blood Type</Label>
            <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
              <SelectTrigger className="h-11 rounded-xl border-gray-300 bg-white">
                <SelectValue placeholder="Select blood type" />
              </SelectTrigger>
              <SelectContent>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Units Required</Label>
            <Input type="number" min="1" max="10" name="units" placeholder="1-10" className="h-11 rounded-xl border-gray-300" required />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Hospital</Label>
            <Input name="hospital" value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)} placeholder="Hospital name" className="h-11 rounded-xl border-gray-300" required />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Patient Name</Label>
            <Input name="patient_name" placeholder="Patient full name" className="h-11 rounded-xl border-gray-300" required />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Urgency</Label>
            <Select name="urgency" defaultValue="normal">
              <SelectTrigger className="h-11 rounded-xl border-gray-300 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Notes (Optional)</Label>
            <Input name="notes" placeholder="Additional information..." className="h-11 rounded-xl border-gray-300" />
          </div>

          <Button type="submit" className="w-full h-12 bg-[#D44A3A] hover:bg-[#c04030] text-white rounded-xl font-semibold">
            Submit Request
          </Button>
        </form>
      </div>

      {/* My Requests */}
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-gray-200 shadow-lg w-full flex-1">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900 border-b border-gray-100 pb-4">
          <Clock className="w-5 h-5 text-[#D44A3A]" />
          My Requests
        </h3>
        <ScrollArea className="h-full pr-3">
          <div className="space-y-4">
            {bloodRequests.length > 0 ? bloodRequests.map(req => (
              <div key={req.id} className="flex flex-col justify-between p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-lg font-semibold text-gray-900">{req.blood_type}</span>
                    <span className="text-sm text-gray-600 ml-2">({req.units_requested} units)</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.status === 'approved' ? 'bg-green-100 text-green-800' :
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{req.hospital_name}</p>
                <p className="text-xs text-gray-500">{new Date(req.created_at).toLocaleDateString()}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No blood requests yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  </div>
)}


         {activeTab === 'pharmacies' && (
  <div className="w-full px-4 md:px-8 py-8 max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8">
    {/* Left Column - Medicines and Pharmacies */}
    <div className="flex-1 flex flex-col gap-8">
      {/* Medicines List */}
      <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-gray-200 shadow-lg w-full">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-[#D7A037] rounded-xl flex items-center justify-center mr-4 shadow-md">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>Medicines</h2>
            <p className="text-gray-600">In-stock medications</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map(medicine => (
            <div key={medicine.id} className="p-6 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{medicine.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{medicine.description}</p>
                </div>
                <span className="bg-green-100 text-green-800 text-sm px-3 py-2 rounded-xl font-bold ml-4">
                  ₹{medicine.price}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className={`text-sm font-medium ${medicine.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                  Stock: {medicine.stock}
                </span>
                <Button
                  size="sm"
                  onClick={() => addToCart(medicine)}
                  disabled={medicine.stock === 0}
                  className="h-10 px-6 bg-[#D7A037] hover:bg-[#c49030] text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {medicine.stock > 0 ? 'Add' : 'Out of Stock'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pharmacies List below Medicines */}
      <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-gray-200 shadow-lg w-full">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-[#D7A037] rounded-xl flex items-center justify-center mr-4 shadow-md">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>Pharmacies</h2>
            <p className="text-gray-600">Nearby pharmacies with verified stock</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-6">
          {pharmacies.filter(p =>
            p.name.toLowerCase().includes(searchPharmacy.toLowerCase()) ||
            p.location.toLowerCase().includes(searchPharmacy.toLowerCase())
          ).map(pharmacy => (
            <div key={pharmacy.id} className="p-6 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all duration-200 hover:-translate-y-1 w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{pharmacy.name}</h3>
              <p className="text-gray-700 mb-1">📍 {pharmacy.address}</p>
              <p className="text-gray-700 mb-1">📞 {pharmacy.contact}</p>
              <p className="text-gray-700 mb-1">🕐 {pharmacy.operating_hours}</p>
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-medium text-gray-800">Services:</span> {pharmacy.services}
              </p>
            </div>
          ))}
          {pharmacies.filter(p =>
            p.name.toLowerCase().includes(searchPharmacy.toLowerCase()) ||
            p.location.toLowerCase().includes(searchPharmacy.toLowerCase())
          ).length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-lg">No pharmacies found</p>
              <p className="text-sm mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Right Sidebar - Cart & Orders */}
    <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-8">
      {/* Shopping Cart */}
      <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-gray-200 shadow-lg sticky top-24 w-full">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-[#D7A037] rounded-xl flex items-center justify-center mr-4 shadow-md">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Your Cart</h2>
        </div>
        
        <ScrollArea className="h-[240px] pr-4 mb-6">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add medicines to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{item.name}</div>
                    <div className="text-sm text-gray-600">₹{item.price} × {item.quantity}</div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="font-bold text-lg text-gray-900">₹{item.price * item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-full p-0"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cart.length > 0 && (
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
              </span>
            </div>
            <Button
              className="w-full h-12 bg-[#D7A037] hover:bg-[#c49030] text-white rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all"
              onClick={placeOrder}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>

      {/* Orders History */}
<div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-gray-200 shadow-lg w-full">
  <div className="flex items-center mb-6">
    <div className="w-12 h-12 bg-[#D7A037] rounded-xl flex items-center justify-center mr-4 shadow-md">
      <Clock className="w-6 h-6 text-white" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Orders</h2>
  </div>
  
  <ScrollArea className="h-[320px] pr-4">
    {myOrders.length === 0 ? (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">No orders yet</p>
        <p className="text-sm mt-1">Your order history will appear here</p>
      </div>
    ) : (
      <div className="space-y-6">
        {myOrders.map(order => (
          <div 
            key={order.id} 
            className="p-6 md:p-8 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow min-h-[150px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm font-semibold text-gray-900">
                  Order #{order.id.slice(0, 8)}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-2 rounded-full text-xs font-semibold ${
                (order.status === 'delivered' || order.status === 'completed') ? 'bg-green-100 text-green-800' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {order.items.map((item, idx) => (
                <span key={idx}>
                  {item.medicine_name} ×{item.quantity}
                  {idx < order.items.length - 1 && ', '}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span className="font-bold text-lg text-gray-900">₹{order.total_amount}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </ScrollArea>
</div>
</div></div>
         )}


          
        </Tabs>
      </main >
    </div >
  );
}