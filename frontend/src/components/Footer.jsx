import { Link } from 'react-router-dom';
import { Ticket, Github, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-campus-dark border-t border-campus-border/30 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                                <Ticket className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold font-display">
                                Campus<span className="gradient-text">Pass</span>
                            </span>
                        </Link>
                        <p className="text-campus-muted text-sm leading-relaxed">
                            India's #1 college event platform. Discover, book, and manage campus events seamlessly.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Platform</h4>
                        <ul className="space-y-2">
                            <li><Link to="/events" className="text-campus-muted hover:text-primary-400 text-sm transition-colors">Browse Events</Link></li>
                            <li><Link to="/signup" className="text-campus-muted hover:text-primary-400 text-sm transition-colors">Create Account</Link></li>
                            <li><Link to="/signup" className="text-campus-muted hover:text-primary-400 text-sm transition-colors">Organize Events</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Categories</h4>
                        <ul className="space-y-2">
                            {['Tech', 'Fest', 'Music', 'Sports', 'Workshop'].map((cat) => (
                                <li key={cat}>
                                    <Link to={`/events?category=${cat}`} className="text-campus-muted hover:text-primary-400 text-sm transition-colors">{cat} Events</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Connect</h4>
                        <div className="flex gap-3 mb-4">
                            {[Twitter, Instagram, Github, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-campus-card border border-campus-border flex items-center justify-center
                                               text-campus-muted hover:text-primary-400 hover:border-primary-500/50 transition-all">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                        <p className="text-campus-muted text-sm">hello@campuspass.in</p>
                    </div>
                </div>

                <div className="border-t border-campus-border/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-campus-muted text-sm">© 2026 CampusPass. Built with ❤️ for Indian colleges.</p>
                    <div className="flex gap-6">
                        <a href="#" className="text-campus-muted hover:text-primary-400 text-sm transition-colors">Privacy</a>
                        <a href="#" className="text-campus-muted hover:text-primary-400 text-sm transition-colors">Terms</a>
                        <a href="#" className="text-campus-muted hover:text-primary-400 text-sm transition-colors">Support</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
