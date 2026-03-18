import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';
import { formatDate, formatPrice, getCategoryBadgeClass } from '../lib/utils';

export default function EventCard({ event }) {
    const {
        _id,
        title,
        category,
        college,
        venue,
        date,
        price,
        totalTickets,
        ticketsSold,
        image,
        featured,
    } = event;

    const availableTickets = totalTickets - ticketsSold;
    const soldPercentage = Math.round((ticketsSold / totalTickets) * 100);

    return (
        <Link to={`/events/${_id}`} className="glass-card-hover group block overflow-hidden">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-campus-card via-transparent to-transparent z-10" />
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-600/30 to-accent-600/30 flex items-center justify-center">
                        <Tag className="w-12 h-12 text-primary-400/50" />
                    </div>
                )}
                {featured && (
                    <span className="absolute top-3 left-3 z-20 px-2 py-1 bg-yellow-500/90 text-yellow-950 text-xs font-bold rounded-lg backdrop-blur-sm">
                        ⭐ Featured
                    </span>
                )}
                <span className={`absolute top-3 right-3 z-20 badge ${getCategoryBadgeClass(category)} backdrop-blur-sm`}>
                    {category}
                </span>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-semibold font-display mb-2 group-hover:text-primary-400 transition-colors line-clamp-1">
                    {title}
                </h3>
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-campus-muted text-sm">
                        <Calendar className="w-4 h-4 text-primary-400" />
                        <span>{formatDate(date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-campus-muted text-sm">
                        <MapPin className="w-4 h-4 text-primary-400" />
                        <span className="line-clamp-1">{venue}, {college}</span>
                    </div>
                    <div className="flex items-center gap-2 text-campus-muted text-sm">
                        <Users className="w-4 h-4 text-primary-400" />
                        <span>{availableTickets > 0 ? `${availableTickets} spots left` : 'Sold out'}</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                    <div className="h-1.5 bg-campus-dark rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${soldPercentage > 80 ? 'bg-red-500' : soldPercentage > 50 ? 'bg-yellow-500' : 'bg-primary-500'
                                }`}
                            style={{ width: `${soldPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${price === 0 ? 'text-green-400' : 'text-white'}`}>
                        {formatPrice(price)}
                    </span>
                    <span className="text-xs text-campus-muted">{soldPercentage}% sold</span>
                </div>
            </div>
        </Link>
    );
}
