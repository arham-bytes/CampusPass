import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatPrice(price) {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
}

export function getCategoryBadgeClass(category) {
    const map = {
        Tech: 'badge-tech',
        Fest: 'badge-fest',
        Music: 'badge-music',
        Sports: 'badge-sports',
        Workshop: 'badge-workshop',
        Seminar: 'badge-seminar',
        Other: 'badge-other',
    };
    return map[category] || 'badge-other';
}

export function getInitials(name) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
