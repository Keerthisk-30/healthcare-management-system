import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, Phone } from 'lucide-react';

export default function DoctorCard({ doctor, onRequestAppointment }) {
    // Parse availability string to display formatted hours
    const formatAvailability = (availabilityStr) => {
        // Example format: "Mon-Fri 9AM-5PM"
        return availabilityStr;
    };

    return (
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all">
            <CardHeader className="pb-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Dr. {doctor.name}
                    </h3>
                    <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {doctor.specialization}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Areas of Focus */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        AREAS OF FOCUS:
                    </h4>
                    <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {doctor.specialization}, M.D, Ph.D
                    </p>
                    <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Experience: {doctor.experience}
                    </p>
                </div>

                {/* Available Hours */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        AVAILABLE HOURS:
                    </h4>
                    <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {doctor.availability}
                    </p>
                </div>

                {/* Contact Info */}
                <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{doctor.contact}</span>
                </div>

                {/* Request Appointment Button */}
                <Button
                    onClick={() => onRequestAppointment(doctor)}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white mt-4"
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    REQUEST APPOINTMENT
                </Button>
            </CardContent>
        </Card>
    );
}
