import { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Download, Loader2, QrCode, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, formatPrice, getCategoryBadgeClass } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data.data || []);
        } catch (error) {
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'text-green-400 bg-green-500/10';
            case 'checked-in': return 'text-blue-400 bg-blue-500/10';
            case 'cancelled': return 'text-red-400 bg-red-500/10';
            default: return 'text-campus-muted bg-campus-dark';
        }
    };

    const downloadTicket = (booking) => {
        // Create a printable ticket
        const w = window.open('', '_blank');
        w.document.write(`
      <html><head><title>CampusPass Ticket - ${booking.ticketId}</title>
      <style>body{font-family:Inter,sans-serif;padding:40px;max-width:600px;margin:0 auto;background:#f9fafb}
      .ticket{border:2px solid #e5e7eb;border-radius:16px;padding:32px;background:white}
      .header{text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px dashed #e5e7eb}
      h1{color:#4f46e5;margin:0}h2{margin:8px 0;color:#111}
      .qr{text-align:center;margin:20px 0}
      .qr img{width:200px;height:200px}
      .info{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
      .info-item{padding:8px 0}.label{font-size:12px;color:#6b7280;text-transform:uppercase}.value{font-weight:600;color:#111}
      .tid{text-align:center;font-size:14px;color:#6b7280;margin-top:16px;padding-top:16px;border-top:2px dashed #e5e7eb}</style></head>
      <body><div class="ticket"><div class="header"><h1>🎫 CampusPass</h1><h2>${booking.event?.title || 'Event'}</h2></div>
      <div class="qr"><img src="${booking.qrCode}" alt="QR Code" /></div>
      <div class="info">
      <div class="info-item"><div class="label">Date</div><div class="value">${booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : '-'}</div></div>
      <div class="info-item"><div class="label">Venue</div><div class="value">${booking.event?.venue || '-'}</div></div>
      <div class="info-item"><div class="label">Attendee</div><div class="value">${user?.name}</div></div>
      <div class="info-item"><div class="label">Amount</div><div class="value">₹${booking.totalAmount}</div></div>
      </div><div class="tid">Ticket ID: ${booking.ticketId}</div></div></body></html>
    `);
        w.document.close();
        w.print();
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="section-heading mb-2">My <span className="gradient-text">Dashboard</span></h1>
                <p className="text-campus-muted">Welcome back, {user?.name}! Here are your bookings.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-6 text-center">
                    <Ticket className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{bookings.length}</p>
                    <p className="text-sm text-campus-muted">Total Bookings</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</p>
                    <p className="text-sm text-campus-muted">Active Tickets</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <QrCode className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'checked-in').length}</p>
                    <p className="text-sm text-campus-muted">Attended</p>
                </div>
            </div>

            {/* Referral */}
            {user?.referralCode && (
                <div className="glass-card p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold mb-1">Your Referral Code</h3>
                        <p className="text-sm text-campus-muted">Share with friends to earn rewards.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="px-4 py-2 bg-campus-dark rounded-lg text-primary-400 font-mono text-lg">{user.referralCode}</code>
                        <button
                            onClick={() => { navigator.clipboard.writeText(user.referralCode); }}
                            className="btn-secondary text-sm !px-3 !py-2"
                        >Copy</button>
                    </div>
                </div>
            )}

            {/* Bookings List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-20 glass-card">
                    <Ticket className="w-16 h-16 text-campus-muted/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                    <p className="text-campus-muted mb-6">Start by exploring events!</p>
                    <a href="/events" className="btn-primary inline-flex">Browse Events</a>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="glass-card p-6 flex flex-col md:flex-row gap-6">
                            {/* Event Image */}
                            <div className="md:w-48 h-32 md:h-auto rounded-xl overflow-hidden flex-shrink-0">
                                {booking.event?.image ? (
                                    <img src={booking.event.image} alt={booking.event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary-600/30 to-accent-600/30 min-h-[8rem]" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-lg font-semibold">{booking.event?.title || 'Event'}</h3>
                                        <span className={`badge ${getStatusColor(booking.status)}`}>{booking.status}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-campus-muted mb-3">
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {booking.event?.date ? formatDate(booking.event.date) : '-'}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {booking.event?.venue || '-'}</span>
                                    </div>
                                    <p className="text-sm text-campus-muted">Ticket: <span className="text-primary-400 font-mono">{booking.ticketId}</span></p>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <span className="font-semibold">{formatPrice(booking.totalAmount)}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setSelectedBooking(selectedBooking?._id === booking._id ? null : booking)}
                                            className="btn-secondary text-sm !px-3 !py-2 flex items-center gap-1">
                                            <QrCode className="w-4 h-4" /> QR Code
                                        </button>
                                        <button onClick={() => downloadTicket(booking)}
                                            className="btn-primary text-sm !px-3 !py-2 flex items-center gap-1">
                                            <Download className="w-4 h-4" /> Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* QR Modal */}
                    {selectedBooking && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
                            <div className="glass-card p-8 max-w-sm w-full text-center animate-slide-up" onClick={(e) => e.stopPropagation()}>
                                <h3 className="text-xl font-semibold mb-2">{selectedBooking.event?.title}</h3>
                                <p className="text-sm text-campus-muted mb-4">Ticket: {selectedBooking.ticketId}</p>
                                <div className="bg-white rounded-2xl p-4 inline-block mb-4">
                                    <img src={selectedBooking.qrCode} alt="QR Code" className="w-48 h-48" />
                                </div>
                                <p className="text-sm text-campus-muted">Show this QR code at the venue for check-in</p>
                                <button onClick={() => setSelectedBooking(null)} className="btn-secondary mt-4 w-full">Close</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
