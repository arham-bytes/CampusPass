import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Users, Ticket, DollarSign, Calendar, Eye, QrCode, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDate, formatPrice, getCategoryBadgeClass } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function OrganizerDashboard() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [scanTicketId, setScanTicketId] = useState('');
    const [scanResult, setScanResult] = useState(null);

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const { data } = await api.get('/events/my/events');
            setEvents(data.data || []);
        } catch (error) {
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async (eventId) => {
        setBookingsLoading(true);
        try {
            const { data } = await api.get(`/bookings/event/${eventId}`);
            setBookings(data.data || []);
        } catch (error) {
            setBookings([]);
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleVerifyTicket = async () => {
        if (!scanTicketId.trim()) return;
        try {
            const { data } = await api.post(`/bookings/verify/${scanTicketId}`);
            setScanResult({ success: true, message: data.message, data: data.data });
            toast.success('Ticket verified! ✅');
            setScanTicketId('');
        } catch (error) {
            setScanResult({ success: false, message: error.response?.data?.message || 'Verification failed' });
            toast.error(error.response?.data?.message || 'Verification failed');
        }
    };

    const totalRevenue = events.reduce((sum, e) => sum + (e.ticketsSold * e.price), 0);
    const totalTicketsSold = events.reduce((sum, e) => sum + e.ticketsSold, 0);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
            default: return <Clock className="w-4 h-4 text-yellow-400" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="section-heading mb-2">Organizer <span className="gradient-text">Dashboard</span></h1>
                    <p className="text-campus-muted">Manage your events, {user?.name}.</p>
                </div>
                <Link to="/organizer/create" className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Create Event
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                {[
                    { icon: Calendar, label: 'Total Events', value: events.length, color: 'text-primary-400' },
                    { icon: Ticket, label: 'Tickets Sold', value: totalTicketsSold, color: 'text-green-400' },
                    { icon: DollarSign, label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-yellow-400' },
                    { icon: CheckCircle, label: 'Approved', value: events.filter(e => e.status === 'approved').length, color: 'text-blue-400' },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card p-6 text-center">
                        <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-campus-muted">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* QR Scanner */}
            <div className="glass-card p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><QrCode className="w-5 h-5 text-primary-400" /> Check-in Scanner</h2>
                <div className="flex gap-2">
                    <input type="text" value={scanTicketId} onChange={(e) => setScanTicketId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyTicket()}
                        className="input-field flex-1" placeholder="Enter or scan Ticket ID (e.g. CP-XXXXXXXXXXXX)" />
                    <button onClick={handleVerifyTicket} className="btn-primary">Verify</button>
                </div>
                {scanResult && (
                    <div className={`mt-3 p-3 rounded-xl text-sm ${scanResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {scanResult.message}
                        {scanResult.data && <span> — {scanResult.data.attendee} for {scanResult.data.event}</span>}
                    </div>
                )}
            </div>

            {/* Events List */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 glass-card">
                    <Calendar className="w-16 h-16 text-campus-muted/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                    <p className="text-campus-muted mb-6">Create your first event and start selling tickets.</p>
                    <Link to="/organizer/create" className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Create Event</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Your Events</h2>
                    {events.map((event) => (
                        <div key={event._id} className="glass-card p-6">
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getStatusIcon(event.status)}
                                        <h3 className="text-lg font-semibold">{event.title}</h3>
                                        <span className={`badge ${getCategoryBadgeClass(event.category)}`}>{event.category}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-campus-muted">
                                        <span>{formatDate(event.date)}</span>
                                        <span>{event.venue}, {event.college}</span>
                                        <span>{event.ticketsSold}/{event.totalTickets} sold</span>
                                        <span>{formatPrice(event.price)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => { setSelectedEvent(selectedEvent === event._id ? null : event._id); fetchBookings(event._id); }}
                                        className="btn-secondary text-sm !px-3 !py-2 flex items-center gap-1">
                                        <Users className="w-4 h-4" /> Registrations
                                    </button>
                                    <Link to={`/events/${event._id}`} className="btn-secondary text-sm !px-3 !py-2 flex items-center gap-1">
                                        <Eye className="w-4 h-4" /> View
                                    </Link>
                                </div>
                            </div>

                            {/* Registrations Dropdown */}
                            {selectedEvent === event._id && (
                                <div className="mt-4 pt-4 border-t border-campus-border/50">
                                    {bookingsLoading ? (
                                        <Loader2 className="w-5 h-5 text-primary-500 animate-spin mx-auto" />
                                    ) : bookings.length === 0 ? (
                                        <p className="text-sm text-campus-muted text-center py-4">No registrations yet</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead><tr className="text-left text-campus-muted border-b border-campus-border/30">
                                                    <th className="pb-2">Attendee</th><th className="pb-2">Email</th><th className="pb-2">College</th><th className="pb-2">Status</th><th className="pb-2">Booked</th>
                                                </tr></thead>
                                                <tbody>
                                                    {bookings.map((b) => (
                                                        <tr key={b._id} className="border-b border-campus-border/10">
                                                            <td className="py-2">{b.user?.name}</td>
                                                            <td className="py-2 text-campus-muted">{b.user?.email}</td>
                                                            <td className="py-2 text-campus-muted">{b.user?.college || '-'}</td>
                                                            <td className="py-2"><span className={`badge text-xs ${b.status === 'checked-in' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{b.status}</span></td>
                                                            <td className="py-2 text-campus-muted">{formatDate(b.createdAt)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
