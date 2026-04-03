import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Ticket, User, LogOut, LayoutDashboard, Plus, Shield, Wallet } from 'lucide-react';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        setProfileOpen(false);
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin';
            case 'organizer': return '/organizer';
            default: return '/dashboard';
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-campus-darker/80 backdrop-blur-xl border-b border-campus-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center
                            group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-all duration-300">
                            <Ticket className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold font-display">
                            eVE<span className="gradient-text">Stro</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link to="/" className="px-4 py-2 rounded-lg text-sm font-medium text-campus-muted hover:text-white hover:bg-campus-card transition-all">
                            Home
                        </Link>
                        <Link to="/events" className="px-4 py-2 rounded-lg text-sm font-medium text-campus-muted hover:text-white hover:bg-campus-card transition-all">
                            Events
                        </Link>
                        {isAuthenticated && user?.role === 'organizer' && (
                            <Link to="/organizer/create" className="px-4 py-2 rounded-lg text-sm font-medium text-campus-muted hover:text-white hover:bg-campus-card transition-all flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Create Event
                            </Link>
                        )}
                        {isAuthenticated && (
                            <Link to="/wallet" className="px-4 py-2 rounded-lg text-sm font-medium text-campus-muted hover:text-white hover:bg-campus-card transition-all flex items-center gap-1">
                                <Wallet className="w-4 h-4" /> ₹{(user?.walletBalance || 0).toLocaleString('en-IN')}
                            </Link>
                        )}
                    </div>

                    {/* Auth Section */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-campus-card border border-campus-border hover:border-primary-500/50 transition-all"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 glass-card p-2 animate-fade-in shadow-xl shadow-black/30">
                                        <div className="px-3 py-2 border-b border-campus-border/50 mb-1">
                                            <p className="text-sm font-medium">{user?.name}</p>
                                            <p className="text-xs text-campus-muted">{user?.email}</p>
                                            <span className="badge badge-tech mt-1 inline-block text-[10px]">{user?.role}</span>
                                        </div>
                                        <Link to={getDashboardLink()} onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-campus-muted hover:text-white hover:bg-campus-dark transition-all">
                                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                                        </Link>
                                        {user?.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-campus-muted hover:text-white hover:bg-campus-dark transition-all">
                                                <Shield className="w-4 h-4" /> Admin Panel
                                            </Link>
                                        )}
                                        <Link to="/wallet" onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-campus-muted hover:text-white hover:bg-campus-dark transition-all">
                                            <Wallet className="w-4 h-4" /> Wallet — ₹{(user?.walletBalance || 0).toLocaleString('en-IN')}
                                        </Link>
                                        <button onClick={handleLogout}
                                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="btn-secondary text-sm !px-4 !py-2">Login</Link>
                                <Link to="/signup" className="btn-primary text-sm !px-4 !py-2">Sign Up</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-campus-card transition-colors">
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-campus-dark/95 backdrop-blur-xl border-t border-campus-border/50 animate-slide-up">
                    <div className="px-4 py-4 space-y-2">
                        <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-campus-muted hover:text-white hover:bg-campus-card transition-all">Home</Link>
                        <Link to="/events" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-campus-muted hover:text-white hover:bg-campus-card transition-all">Events</Link>
                        {isAuthenticated ? (
                            <>
                                <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-campus-muted hover:text-white hover:bg-campus-card transition-all">Dashboard</Link>
                                {user?.role === 'organizer' && (
                                    <Link to="/organizer/create" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-campus-muted hover:text-white hover:bg-campus-card transition-all">Create Event</Link>
                                )}
                                <Link to="/wallet" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl text-campus-muted hover:text-white hover:bg-campus-card transition-all flex items-center gap-2">
                                    <Wallet className="w-4 h-4" /> Wallet — ₹{(user?.walletBalance || 0).toLocaleString('en-IN')}
                                </Link>
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2 pt-2">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="btn-secondary flex-1 text-center text-sm">Login</Link>
                                <Link to="/signup" onClick={() => setIsOpen(false)} className="btn-primary flex-1 text-center text-sm">Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
