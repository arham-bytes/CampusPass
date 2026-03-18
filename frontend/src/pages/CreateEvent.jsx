import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2, Calendar, MapPin, Tag, DollarSign, Users, FileText } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Tech', 'Fest', 'Music', 'Sports', 'Workshop', 'Seminar', 'Other'];

export default function CreateEvent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [form, setForm] = useState({
        title: '', description: '', category: 'Tech', college: '', venue: '',
        date: '', time: '', price: 0, totalTickets: 100,
    });
    const [imageFile, setImageFile] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.college || !form.venue || !form.date) {
            return toast.error('Please fill all required fields');
        }
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => formData.append(key, form[key]));
            if (imageFile) formData.append('image', imageFile);

            await api.post('/events', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Event created! It will be reviewed by admin.');
            navigate('/organizer');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="section-heading mb-2">Create <span className="gradient-text">Event</span></h1>
                <p className="text-campus-muted">Fill in the details to create your event. It will be reviewed by admin before going live.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2">Event Banner</label>
                    <label className="block cursor-pointer">
                        <div className={`border-2 border-dashed rounded-2xl transition-all ${imagePreview ? 'border-primary-500/50' : 'border-campus-border hover:border-primary-500/30'
                            } overflow-hidden`}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-campus-muted">
                                    <Upload className="w-10 h-10 mb-3 text-primary-400/50" />
                                    <p className="text-sm">Click to upload event banner</p>
                                    <p className="text-xs mt-1 text-campus-muted/60">JPG, PNG, WebP — Max 5MB</p>
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-primary-400" /> Title *</label>
                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="input-field" placeholder="e.g. TechFest 2026 Hackathon" maxLength={120} />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="input-field h-32 resize-none" placeholder="Describe your event in detail..." maxLength={5000} />
                </div>

                {/* Category & College */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Tag className="w-4 h-4 text-primary-400" /> Category *</label>
                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="input-field">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">College *</label>
                        <input type="text" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })}
                            className="input-field" placeholder="e.g. IIT Bombay" />
                    </div>
                </div>

                {/* Venue & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400" /> Venue *</label>
                        <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })}
                            className="input-field" placeholder="e.g. Main Auditorium" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-400" /> Date *</label>
                        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="input-field" />
                    </div>
                </div>

                {/* Time */}
                <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <input type="text" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                        className="input-field" placeholder="e.g. 10:00 AM - 5:00 PM" />
                </div>

                {/* Price & Tickets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary-400" /> Price (₹) *</label>
                        <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                            className="input-field" placeholder="0 for free" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-primary-400" /> Total Tickets *</label>
                        <input type="number" min="1" value={form.totalTickets} onChange={(e) => setForm({ ...form, totalTickets: Number(e.target.value) })}
                            className="input-field" placeholder="100" />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full text-lg flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Event'}
                </button>
            </form>
        </div>
    );
}
