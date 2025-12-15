import { useState } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Activity, Calendar, Droplet, MessageSquare, Pill, Shield, Users } from 'lucide-react';

export default function LandingPage({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const loginData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      toast.success('Login successful!');
      onLogin(response.data.access_token, response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const registerData = {
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      phone: formData.get('phone'),
      role: 'user',
    };

    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      toast.success('Registration successful!');
      onLogin(response.data.access_token, response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const [showAuthPage, setShowAuthPage] = useState(false);

  // If showing auth page, render the auth forms
  if (showAuthPage) {
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
            <div className="flex items-center space-x-3">
              <div className="logo-container" style={{ width: '50px', height: '50px', borderRadius: '12px' }}>
                <svg className="ecg-svg" viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
                  <path className="ecg-line" d="M0 25 L55 25 L65 5 L75 45 L85 25 L150 25" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Health<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#235A87] to-[#2FAF8A]">Care</span>
              </h1>
            </div>
            <Button
              onClick={() => setShowAuthPage(false)}
              variant="outline"
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-100 rounded-xl px-4 py-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Button>
          </div>
        </header>

        {/* Auth Forms */}
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-md">
            <div className="card-3d bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-none">
                  <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md" data-testid="login-tab">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md" data-testid="register-tab">Create Account</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Welcome Back</h2>
                    <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Sign in to continue to your dashboard</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-700">Email</Label>
                      <Input id="login-email" name="email" type="email" required placeholder="you@example.com" className="bg-white/50 border-gray-200 rounded-xl focus:border-[#235A87] focus:ring-[#235A87]" data-testid="login-email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-700">Password</Label>
                      <Input id="login-password" name="password" type="password" required minLength={8} maxLength={20} placeholder="••••••••" className="bg-white/50 border-gray-200 rounded-xl focus:border-[#235A87] focus:ring-[#235A87]" data-testid="login-password" />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-[#235A87] to-[#2FAF8A] hover:from-[#1a4a6f] hover:to-[#259c78] text-white rounded-xl py-6 font-semibold shadow-lg hover:shadow-[#235A87]/30 transition-all duration-300" disabled={isLoading} data-testid="login-button">
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="register" className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Create Account</h2>
                    <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Join us to access healthcare services</p>
                  </div>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-gray-700">Full Name</Label>
                      <Input id="register-name" name="name" required placeholder="John Doe" className="bg-white/50 border-gray-200 rounded-xl focus:border-[#235A87] focus:ring-[#235A87]" data-testid="register-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gray-700">Email</Label>
                      <Input id="register-email" name="email" type="email" required placeholder="you@example.com" className="bg-white/50 border-gray-200 rounded-xl focus:border-[#235A87] focus:ring-[#235A87]" data-testid="register-email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-phone" className="text-gray-700">Phone</Label>
                      <Input id="register-phone" name="phone" type="tel" required placeholder="+1 234 567 890" className="bg-white/50 border-gray-200 rounded-xl focus:border-[#235A87] focus:ring-[#235A87]" data-testid="register-phone" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-700">Password</Label>
                      <Input id="register-password" name="password" type="password" required minLength={8} maxLength={20} placeholder="••••••••" className="bg-white/50 border-gray-200 rounded-xl focus:border-[#235A87] focus:ring-[#235A87]" data-testid="register-password" />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-[#2FAF8A] to-[#235A87] hover:from-[#259c78] hover:to-[#1a4a6f] text-white rounded-xl py-6 font-semibold shadow-lg hover:shadow-[#2FAF8A]/30 transition-all duration-300" disabled={isLoading} data-testid="register-button">
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#2FAF8A]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#235A87]/20 blur-[120px]" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-[#D7A037]/20 blur-[100px]" />
      </div>

      {/* Header with Sign In Button */}
      <header className="backdrop-blur-xl bg-white/80 sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="logo-container" style={{ width: '50px', height: '50px', borderRadius: '12px' }}>
              <svg className="ecg-svg" viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
                <path className="ecg-line" d="M0 25 L55 25 L65 5 L75 45 L85 25 L150 25" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Health<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#235A87] to-[#2FAF8A]">Care</span>
            </h1>
          </div>
          <Button
            onClick={() => setShowAuthPage(true)}
            className="bg-gradient-to-r from-[#235A87] to-[#2FAF8A] hover:from-[#1a4a6f] hover:to-[#259c78] text-white rounded-xl px-6 py-2 font-semibold shadow-lg hover:shadow-[#235A87]/30 transition-all duration-300"
          >
            Sign In or Create Account
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden perspective-1000">
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="logo-container" style={{ width: '120px', height: '120px', borderRadius: '25px' }}>
                <svg className="ecg-svg" viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
                  <path className="ecg-line" d="M0 25 L55 25 L65 5 L75 45 L85 25 L150 25" />
                </svg>
              </div>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-8 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <span className="text-gray-800">Healthcare</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#235A87] to-[#2FAF8A]" style={{ WebkitTextStroke: '1px rgba(35, 90, 135, 0.3)' }}>Management</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 font-medium leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your comprehensive AI-powered healthcare platform for appointments, blood bank information, and 24/7 medical assistance
            </p>
          </div>


          {/* Features Grid - Single Line Layout */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12" style={{ fontFamily: 'Manrope, sans-serif' }}>
              INTEGRATED HEALTHCARE PLATFORM
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
              {/* Blood Bank Management Card */}
              <div className="feature-card feature-card-red" data-testid="feature-blood-bank">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <Droplet className="w-8 h-8 text-white" />
                </div>
                <h3 className="feature-card-title">Blood Bank<br />Management</h3>
              </div>

              {/* Doctor Appointment Card */}
              <div className="feature-card feature-card-green" data-testid="feature-appointments">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="feature-card-title">Doctor<br />Appointment</h3>
              </div>

              {/* AI Chatbot Card */}
              <div className="feature-card feature-card-blue" data-testid="feature-chatbot">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="feature-card-title">AI Chatbot</h3>
              </div>

              {/* Pharmacy Card */}
              <div className="feature-card feature-card-gold" data-testid="feature-pharmacy">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <Pill className="w-8 h-8 text-white" />
                </div>
                <h3 className="feature-card-title">Pharmacy</h3>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}