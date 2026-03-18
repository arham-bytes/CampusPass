import { useState, useEffect } from 'react';
import { Users, Calendar, Ticket, DollarSign, CheckCircle, XCircle, Star, Loader2, Eye, TrendingUp, Clock } from 'lucide-react';
import { formatDate, formatPrice, getCategoryBadgeClass } from '../lib/utils';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboard, setDashboard] = useState(null);
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    useEffect(() => {
        if (activeTab === 'events') fetchEvents();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'transactions') fetchTransactions();
    }, [activeTab]);

    const fetchDashboard = async () => {
        try {
            const { data } = await api.get('/admin/dashboard');
            setDashboard(data.data);
        } catch (err) {
            setDashboard(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const { data } = await api.get('/admin/events');
            setEvents(data.data || []);
        } catch (err) { setEvents([]); }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data.data || []);
        } catch (err) { setUsers([]); }
    };

    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/admin/transactions');
            setTransactions(data.data || []);
        } catch (err) { setTransactions([]); }
    };

    const handleEventStatus = async (id, status) => {
        try {
            await api.put(`/admin/events/${id}/status`, { status });
            toast.success(`Event ${status}`);
            fetchEvents();
            fetchDashboard();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            await api.put(`/admin/events/${id}/feature`);
            toast.success('Featured status updated');
            fetchEvents();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const handleToggleUser = async (id) => {
        try {
            await api.put(`/admin/users/${id}/toggle`);
            toast.success('User status updated');
            fetchUsers();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'transactions', label: 'Transactions', icon: DollarSign },
    ];

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="section-heading mb-2">Admin <span className="gradient-text">Panel</span></h1>
                <p className="text-campus-muted">Manage the entire CampusPass platform.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${activeTab === tab.id
                                ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                : 'bg-campus-card border-campus-border text-campus-muted hover:border-campus-muted'
                            }`}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && dashboard && (
                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { icon: Users, label: 'Users', value: dashboard.totalUsers, color: 'text-blue-400' },
                            { icon: Calendar, label: 'Events', value: dashboard.totalEvents, color: 'text-purple-400' },
                            { icon: Ticket, label: 'Bookings', value: dashboard.totalBookings, color: 'text-green-400' },
                            { icon: DollarSign, label: 'Revenue', value: `₹${dashboard.totalRevenue.toLocaleString('en-IN')}`, color: 'text-yellow-400' },
                            { icon: Clock, label: 'Pending', value: dashboard.pendingEvents, color: 'text-orange-400' },
                        ].map((stat) => (
                            <div key={stat.label} className="glass-card p-6 text-center">
                                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm text-campus-muted">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts Placeholder */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Category Distribution */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold mb-4">Event Categories</h3>
                            <div className="space-y-3">
                                {(dashboard.categoryStats || []).map((cat) => (
                                    <div key={cat._id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`badge ${getCategoryBadgeClass(cat._id)}`}>{cat._id}</span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-1 ml-4">
                                            <div className="flex-1 h-2 bg-campus-dark rounded-full overflow-hidden">
                                                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(cat.count / dashboard.totalEvents) * 100}%` }} />
                                            </div>
                                            <span className="text-sm font-medium w-8 text-right">{cat.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Monthly Revenue */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
                            <div className="space-y-3">
                                {(dashboard.monthlyRevenue || []).map((m) => (
                                    <div key={m._id} className="flex items-center justify-between">
                                        <span className="text-sm text-campus-muted w-20">{m._id}</span>
                                        <div className="flex-1 mx-4 h-2 bg-campus-dark rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full"
                                                style={{ width: `${Math.min((m.revenue / (dashboard.totalRevenue || 1)) * 100, 100)}%` }} />
                                        </div>
                                        <span className="text-sm font-medium w-24 text-right">₹{m.revenue.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                                {(!dashboard.monthlyRevenue || dashboard.monthlyRevenue.length === 0) && (
                                    <p className="text-sm text-campus-muted text-center py-8">No revenue data yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                        {dashboard.recentBookings?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="text-left text-campus-muted border-b border-campus-border/30">
                                        <th className="pb-2">User</th><th className="pb-2">Event</th><th className="pb-2">Date</th>
                                    </tr></thead>
                                    <tbody>
                                        {dashboard.recentBookings.map((b) => (
                                            <tr key={b._id} className="border-b border-campus-border/10">
                                                <td className="py-2">{b.user?.name}</td>
                                                <td className="py-2 text-campus-muted">{b.event?.title}</td>
                                                <td className="py-2 text-campus-muted">{formatDate(b.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="text-sm text-campus-muted text-center py-4">No bookings yet</p>}
                    </div>
                </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="space-y-4">
                    {events.length === 0 ? (
                        <div className="text-center py-20 glass-card"><p className="text-campus-muted">No events</p></div>
                    ) : events.map((event) => (
                        <div key={event._id} className="glass-card p-6">
                            <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <h3 className="font-semibold text-lg">{event.title}</h3>
                                        <span className={`badge ${getCategoryBadgeClass(event.category)}`}>{event.category}</span>
                                        <span className={`badge ${event.status === 'approved' ? 'bg-green-500/20 text-green-400' : event.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {event.status}
                                        </span>
                                        {event.featured && <span className="badge bg-yellow-500/20 text-yellow-400">⭐</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-campus-muted">
                                        <span>By: {event.organizer?.name}</span>
                                        <span>{event.college}</span>
                                        <span>{formatDate(event.date)}</span>
                                        <span>{event.ticketsSold}/{event.totalTickets} sold</span>
                                        <span>{formatPrice(event.price)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                    {event.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleEventStatus(event._id, 'approved')}
                                                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all">
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                            <button onClick={() => handleEventStatus(event._id, 'rejected')}
                                                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all">
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => handleToggleFeatured(event._id)}
                                        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm border transition-all ${event.featured ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-campus-dark text-campus-muted border-campus-border hover:border-yellow-500/30'}`}>
                                        <Star className="w-4 h-4" /> {event.featured ? 'Unfeature' : 'Feature'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="glass-card p-6">
                    {users.length === 0 ? (
                        <p className="text-center text-campus-muted py-8">No users</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="text-left text-campus-muted border-b border-campus-border/30">
                                    <th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Role</th><th className="pb-3">College</th><th className="pb-3">Status</th><th className="pb-3">Joined</th><th className="pb-3">Action</th>
                                </tr></thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id} className="border-b border-campus-border/10">
                                            <td className="py-3 font-medium">{u.name}</td>
                                            <td className="py-3 text-campus-muted">{u.email}</td>
                                            <td className="py-3"><span className="badge badge-tech">{u.role}</span></td>
                                            <td className="py-3 text-campus-muted">{u.college || '-'}</td>
                                            <td className="py-3">
                                                <span className={`badge ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-campus-muted">{formatDate(u.createdAt)}</td>
                                            <td className="py-3">
                                                <button onClick={() => handleToggleUser(u._id)}
                                                    className={`text-xs px-3 py-1 rounded-lg border transition-all ${u.isActive ? 'text-red-400 border-red-500/30 hover:bg-red-500/10' : 'text-green-400 border-green-500/30 hover:bg-green-500/10'}`}>
                                                    {u.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
                <div className="glass-card p-6">
                    {transactions.length === 0 ? (
                        <p className="text-center text-campus-muted py-8">No transactions</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="text-left text-campus-muted border-b border-campus-border/30">
                                    <th className="pb-3">User</th><th className="pb-3">Event</th><th className="pb-3">Amount</th><th className="pb-3">Status</th><th className="pb-3">Razorpay ID</th><th className="pb-3">Date</th>
                                </tr></thead>
                                <tbody>
                                    {transactions.map((t) => (
                                        <tr key={t._id} className="border-b border-campus-border/10">
                                            <td className="py-3">{t.user?.name}</td>
                                            <td className="py-3 text-campus-muted">{t.event?.title}</td>
                                            <td className="py-3 font-medium">₹{t.amount}</td>
                                            <td className="py-3">
                                                <span className={`badge ${t.status === 'paid' ? 'bg-green-500/20 text-green-400' : t.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-campus-muted font-mono text-xs">{t.razorpayPaymentId || '-'}</td>
                                            <td className="py-3 text-campus-muted">{formatDate(t.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
