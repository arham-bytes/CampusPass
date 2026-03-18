import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, X, Loader2 } from 'lucide-react';
import api from '../api/axios';
import EventCard from '../components/EventCard';

const CATEGORIES = ['All', 'Tech', 'Fest', 'Music', 'Sports', 'Workshop', 'Seminar', 'Other'];

export default function Events() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || 'All',
        college: searchParams.get('college') || '',
        startDate: searchParams.get('startDate') || '',
    });

    useEffect(() => {
        fetchEvents();
    }, [searchParams]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.category !== 'All') params.category = filters.category;
            if (filters.search) params.search = filters.search;
            if (filters.college) params.college = filters.college;
            if (filters.startDate) params.startDate = filters.startDate;
            params.page = searchParams.get('page') || 1;

            const { data } = await api.get('/events', { params });
            setEvents(data.data || []);
            setPagination(data.pagination || {});
        } catch (error) {
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const params = {};
        if (filters.category !== 'All') params.category = filters.category;
        if (filters.search) params.search = filters.search;
        if (filters.college) params.college = filters.college;
        if (filters.startDate) params.startDate = filters.startDate;
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({ search: '', category: 'All', college: '', startDate: '' });
        setSearchParams({});
    };

    const hasActiveFilters = filters.category !== 'All' || filters.search || filters.college || filters.startDate;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="section-heading mb-2">Discover <span className="gradient-text">Events</span></h1>
                <p className="text-campus-muted">Find your next campus experience.</p>
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-campus-muted" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="input-field !pl-12"
                            placeholder="Search events, colleges..."
                        />
                    </div>

                    {/* College filter */}
                    <input
                        type="text"
                        value={filters.college}
                        onChange={(e) => setFilters({ ...filters, college: e.target.value })}
                        className="input-field lg:w-48"
                        placeholder="College name"
                    />

                    {/* Date filter */}
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="input-field lg:w-44"
                    />

                    <button onClick={applyFilters} className="btn-primary flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>

                {/* Category chips */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setFilters({ ...filters, category: cat });
                                const params = {};
                                if (cat !== 'All') params.category = cat;
                                if (filters.search) params.search = filters.search;
                                setSearchParams(params);
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filters.category === cat
                                    ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                    : 'bg-campus-dark border-campus-border text-campus-muted hover:border-campus-muted'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-all flex items-center gap-1">
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20">
                    <Calendar className="w-16 h-16 text-campus-muted/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No events found</h3>
                    <p className="text-campus-muted">Try adjusting your filters or check back later.</p>
                </div>
            ) : (
                <>
                    <p className="text-sm text-campus-muted mb-6">{pagination.total || events.length} events found</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <EventCard key={event._id} event={event} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-10">
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page })}
                                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${pagination.page === page
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-campus-card border border-campus-border text-campus-muted hover:border-primary-500/50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
