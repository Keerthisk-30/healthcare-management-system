import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, UserPlus, Trash2, LogOut, Users, Loader2, Mail, Phone, User } from 'lucide-react';
import axios from 'axios';
import { API } from '@/App';

export default function SuperAdminPanel({ user, onLogout }) {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await axios.get(`${API}/admin/list`);
            setAdmins(response.data);
        } catch (error) {
            toast.error('Failed to fetch admin users');
            console.error(error);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target);
        const adminData = {
            email: formData.get('email'),
            name: formData.get('name'),
            phone: formData.get('phone'),
            password: formData.get('password'),
        };

        try {
            await axios.post(`${API}/admin/create`, adminData);
            toast.success('Admin user created successfully!');
            setShowCreateForm(false);
            e.target.reset();
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create admin user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAdmin = async (adminId, adminName) => {
        if (!window.confirm(`Are you sure you want to delete admin user "${adminName}"?`)) {
            return;
        }

        try {
            await axios.delete(`${API}/admin/${adminId}`);
            toast.success('Admin user deleted successfully!');
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to delete admin user');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
            {/* Professional Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg border border-indigo-200/50">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    Super Admin Panel
                                </h1>
                                <p className="text-lg text-gray-600 font-medium mt-1">Administrator Management System</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-right hidden md:block">
                                <p className="font-semibold text-gray-900">{user?.name}</p>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={onLogout}
                                className="h-12 px-8 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
                <div className="grid lg:grid-cols-4 gap-8 mb-12">
                    {/* KPI Card */}
                    <Card className="lg:col-span-1 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-xl transition-all duration-300 border hover:border-indigo-300">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-indigo-100 rounded-xl">
                                    <Users className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Admins</p>
                                    <p className="text-4xl font-bold text-gray-900">{admins.length}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 font-medium">Active administrators</div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            size="lg"
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className={`h-20 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group ${showCreateForm 
                                ? 'bg-rose-600 hover:bg-rose-700 border-rose-200 text-white shadow-rose-200/50' 
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-200/50'
                            }`}
                        >
                            {showCreateForm ? (
                                <>
                                    <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                                    Create Admin
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Create Form */}
                    {showCreateForm && (
                        <div className="lg:col-span-2 order-2 lg:order-1">
                            <Card className="border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                <CardHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                                            <UserPlus className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                                Create Administrator
                                            </CardTitle>
                                            <CardDescription className="text-lg text-gray-600 mt-1">
                                                Add new administrator with full system privileges
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={handleCreateAdmin} className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                    <User className="w-5 h-5 text-indigo-600" />
                                                    Full Name
                                                </Label>
                                                <Input
                                                    name="name"
                                                    type="text"
                                                    placeholder="Enter full name"
                                                    required
                                                    className="h-14 text-lg rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/50 shadow-sm hover:border-indigo-300 transition-all duration-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                    <Mail className="w-5 h-5 text-indigo-600" />
                                                    Email Address
                                                </Label>
                                                <Input
                                                    name="email"
                                                    type="email"
                                                    placeholder="admin@company.com"
                                                    required
                                                    className="h-14 text-lg rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/50 shadow-sm hover:border-indigo-300 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                    <Phone className="w-5 h-5 text-indigo-600" />
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    name="phone"
                                                    type="tel"
                                                    placeholder="+1 (555) 123-4567"
                                                    required
                                                    className="h-14 text-lg rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/50 shadow-sm hover:border-indigo-300 transition-all duration-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                    🔒 Password
                                                </Label>
                                                <Input
                                                    name="password"
                                                    type="password"
                                                    placeholder="Minimum 8 characters"
                                                    minLength={8}
                                                    required
                                                    className="h-14 text-lg rounded-xl border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100/50 shadow-sm hover:border-purple-300 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 pt-4">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                                        Creating Account...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-6 h-6 mr-3" />
                                                        Create Administrator
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Admin List */}
                    <div className={`lg:col-span-${showCreateForm ? '1' : '3'} order-1 lg:order-2`}>
                        <Card className="border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                            <CardHeader className="pb-6">
                                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    <Shield className="w-8 h-8 text-indigo-600" />
                                    Admin Users ({admins.length})
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    Manage administrator accounts and permissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {admins.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                            <Users className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                            No Administrators
                                        </h3>
                                        <p className="text-gray-600 max-w-sm mx-auto">
                                            Create your first administrator to manage the system
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {admins.map((admin, index) => (
                                            <Card key={admin.id} className="hover:shadow-md hover:border-indigo-200 transition-all duration-200 border-gray-100">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                                            <div className="p-3 bg-indigo-100 rounded-xl flex-shrink-0">
                                                                <Shield className="w-6 h-6 text-indigo-600" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="font-bold text-xl text-gray-900 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                                                    {admin.name}
                                                                </h4>
                                                                <p className="text-gray-700 font-medium truncate mb-1">{admin.email}</p>
                                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                    <span className="w-4 h-4 bg-gray-300 rounded-full flex-shrink-0" />
                                                                    {admin.phone}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-shrink-0">
                                                            <span className="px-4 py-2 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-xl border border-indigo-200">
                                                                Admin
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                                                                className="h-12 w-12 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 text-gray-500 shadow-sm hover:shadow-md transition-all duration-200"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
