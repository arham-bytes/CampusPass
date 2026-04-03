import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Calendar, CreditCard, Ticket, Star, Zap, Shield, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import EventCard from '../components/EventCard';

export default function Home() {
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data } = await api.get('/events?limit=6');
                setFeaturedEvents(data.data || []);
            } catch (error) {
                console.log('Using demo data');
                setFeaturedEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const categories = [
        { name: 'Tech', icon: Zap, color: 'from-blue-500 to-cyan-500', desc: 'Hackathons & Coding' },
        { name: 'Fest', icon: Sparkles, color: 'from-purple-500 to-pink-500', desc: 'College Festivals' },
        { name: 'Music', icon: Star, color: 'from-pink-500 to-rose-500', desc: 'Live Shows & Concerts' },
        { name: 'Sports', icon: TrendingUp, color: 'from-green-500 to-emerald-500', desc: 'Tournaments & Matches' },
        { name: 'Workshop', icon: Users, color: 'from-yellow-500 to-orange-500', desc: 'Learn & Grow' },
        { name: 'Seminar', icon: Shield, color: 'from-cyan-500 to-blue-500', desc: 'Talks & Panels' },
    ];



    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-[100px] animate-float" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[150px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8 animate-fade-in">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                            <span className="text-sm text-primary-300">India's #1 College Event Platform</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-tight mb-6 animate-slide-up">
                            Your Campus Events,{' '}
                            <span className="gradient-text">One Click Away</span>
                        </h1>

                        <p className="text-lg md:text-xl text-campus-muted max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Discover hackathons, college fests, concerts, sports tournaments, and more happening across Indian campuses. Book tickets instantly.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <Link to="/events" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group">
                                Explore Events
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/signup" className="btn-secondary text-lg px-8 py-4">
                                Start Organizing
                            </Link>
                        </div>
                    </div>


                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="section-heading mb-4">Explore by <span className="gradient-text">Category</span></h2>
                        <p className="text-campus-muted max-w-xl mx-auto">From tech hackathons to music concerts — find events that match your vibe.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.name}
                                to={`/events?category=${cat.name}`}
                                className="glass-card-hover p-6 text-center group"
                            >
                                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 
                                 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                                    <cat.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="font-semibold mb-1">{cat.name}</h3>
                                <p className="text-xs text-campus-muted">{cat.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Events */}
            {featuredEvents.length > 0 && (
                <section className="py-20 bg-campus-dark/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="section-heading mb-2">Trending <span className="gradient-text">Events</span></h2>
                                <p className="text-campus-muted">Don't miss out on what's happening.</p>
                            </div>
                            <Link to="/events" className="btn-secondary flex items-center gap-2 text-sm">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredEvents.map((event) => (
                                <EventCard key={event._id} event={event} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* How It Works */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="section-heading mb-4">How It <span className="gradient-text">Works</span></h2>
                        <p className="text-campus-muted max-w-xl mx-auto">Three simple steps to your next campus adventure.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', icon: Calendar, title: 'Discover Events', desc: 'Browse hundreds of events across colleges in India. Filter by category, college, or date.' },
                            { step: '02', icon: CreditCard, title: 'Book & Pay', desc: 'Secure your spot instantly using your Evestro Wallet. Get your QR-coded ticket.' },
                            { step: '03', icon: Ticket, title: 'Attend & Enjoy', desc: 'Show your QR ticket at the venue. Instant check-in. No hassle.' },
                        ].map((item) => (
                            <div key={item.step} className="glass-card p-8 relative group hover:border-primary-500/50 transition-all duration-300">
                                <span className="text-5xl font-extrabold text-primary-500/10 absolute top-4 right-6 font-display">{item.step}</span>
                                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-6 group-hover:bg-primary-500/20 transition-colors">
                                    <item.icon className="w-7 h-7 text-primary-400" />
                                </div>
                                <h3 className="text-xl font-semibold font-display mb-3">{item.title}</h3>
                                <p className="text-campus-muted text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="glass-card p-12 md:p-16 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-600/10" />
                        <div className="relative">
                            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
                                Ready to host your <span className="gradient-text">next big event?</span>
                            </h2>
                            <p className="text-campus-muted mb-8 max-w-xl mx-auto">
                                Set up your event in minutes, sell tickets, and track everything — all in one platform.
                            </p>
                            <Link to="/signup" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2 group">
                                Get Started Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
