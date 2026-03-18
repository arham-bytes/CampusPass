import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Ticket, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: 'student', college: '', phone: '', referredBy: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) return toast.error('Please fill required fields');
        if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

        setLoading(true);
        try {
            const { confirmPassword, ...userData } = form;
            const data = await register(userData);
            toast.success(`Welcome to CampusPass, ${data.user.name}!`);
            const dest = data.user.role === 'organizer' ? '/organizer' : '/dashboard';
            navigate(dest);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-lg relative">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold font-display mt-4">Create your account</h1>
                    <p className="text-campus-muted mt-2">Join thousands of students on CampusPass</p>
                </div>

                <div className="glass-card p-8">
                    {/* Role Selector */}
                    <div className="flex gap-2 mb-6">
                        {['student', 'organizer'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setForm({ ...form, role })}
                                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border ${form.role === role
                                        ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                        : 'bg-campus-dark border-campus-border text-campus-muted hover:border-campus-muted'
                                    }`}
                            >
                                {role === 'student' ? '🎓 Student' : '🎪 Organizer'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="input-field" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone</label>
                                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="input-field" placeholder="+91 9876543210" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email *</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="input-field" placeholder="you@college.edu" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">College Name</label>
                            <input type="text" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })}
                                className="input-field" placeholder="IIT Mumbai" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Password *</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="input-field pr-12" placeholder="Min 6 characters" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-campus-muted hover:text-white transition-colors">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                                <input type="password" value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    className="input-field" placeholder="••••••••" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Referral Code (optional)</label>
                            <input type="text" value={form.referredBy} onChange={(e) => setForm({ ...form, referredBy: e.target.value })}
                                className="input-field" placeholder="CP-XXXXXXXX" />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-campus-muted mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
