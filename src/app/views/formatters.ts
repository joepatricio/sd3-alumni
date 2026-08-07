import { format } from 'date-fns';

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

export type DateFormatPreset = 'long' | 'short' | 'full' | 'datetime' | 'iso';

const DATE_FORMAT_PATTERNS: Record<DateFormatPreset, string> = {
    long: 'MMMM d, yyyy',
    short: 'MMM d, yyyy',
    full: 'EEEE, MMMM d, yyyy',
    datetime: 'MMM d, yyyy, h:mm a',
    iso: 'yyyy-MM-dd'
};

export function formatDate(
    dateInput: Date | string | number | null | undefined,
    styleOrPattern: DateFormatPreset | string = 'long',
    fallback: string = 'N/A'
): string {
    if (!dateInput) return fallback;
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return fallback;

    const pattern =
        styleOrPattern in DATE_FORMAT_PATTERNS
            ? DATE_FORMAT_PATTERNS[styleOrPattern as DateFormatPreset]
            : styleOrPattern;

    return format(date, pattern);
}


export function getStatusColor(statusName: string): string {
    const format = statusName.toLowerCase().trim();
    switch (format) {
        case 'completed':
        case 'accepted':
        case 'approved':
            return 'bg-green-100 text-green-700';
        case 'processing':
        case 'pending':
            return 'bg-yellow-100 text-yellow-700';
        case 'failed':
        case 'blocked':
        case 'rejected':
        case 'banned':
        case 'suspended':
            return 'bg-red-100 text-red-700';
        case 'official':
            return 'bg-blue-100 text-blue-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

export function getCategoryColor(category: string): string {
    const format = category.toLowerCase().trim();
    switch (format) {
        case 'reunion':
            return 'bg-blue-600 hover:bg-blue-700 text-white';
        case 'workshop':
            return 'bg-purple-600 hover:bg-purple-700 text-white';
        case 'conference':
            return 'bg-indigo-600 hover:bg-indigo-700 text-white';
        case 'networking':
            return 'bg-pink-600 hover:bg-pink-700 text-white';
        case 'sports':
            return 'bg-brand-primary hover:bg-orange-700 text-white';
        case 'virtual':
            return 'bg-teal-600 hover:bg-teal-700 text-white';
        case 'announcements':
            return 'bg-blue-600 hover:bg-blue-700 text-white';
        case 'careers':
            return 'bg-emerald-600 hover:bg-emerald-700 text-white';
        case 'success stories':
            return 'bg-amber-600 hover:bg-amber-700 text-white';
        case 'donations':
            return 'bg-rose-600 hover:bg-rose-700 text-white';
        case 'others':
            return 'bg-slate-600 hover:bg-slate-700 text-white';
        case 'official':
            return 'bg-brand-primary hover:bg-brand-primary-hover text-white';
        case 'regular':
            return 'bg-brand-accent hover:bg-brand-accent-hover text-white';
        default:
            return 'bg-brand-primary-hover hover:bg-brand-primary text-white'; // default orange
    }
}

export function getBankColor(bankName: string): string {
    const format = bankName.toLowerCase().trim();
    if (format.includes('bdo')) return '#003B8E';
    if (format.includes('bpi')) return '#B11116';
    if (format.includes('metrobank')) return '#005BAC';
    if (format.includes('land bank') || format.includes('landbank')) return '#00843D';
    if (format.includes('pnb') || format.includes('philippine national bank')) return '#F58220';
    if (format.includes('security bank')) return '#0055A4';
    if (format.includes('unionbank') || format.includes('union bank')) return '#F36F21';
    if (format.includes('rcbc')) return '#0054A6';
    if (format.includes('china bank') || format.includes('chinabank')) return '#00843D';
    if (format.includes('eastwest')) return '#C2185B';
    if (format.includes('psbank')) return '#00529B';
    if (format.includes('maybank')) return '#FFC20E';
    if (format.includes('bank of commerce')) return '#00539F';
    if (format.includes('robinsons')) return '#00529B';
    if (format.includes('dbp') || format.includes('development bank')) return '#00529C';
    if (format.includes('gcash')) return '#007DF2';
    if (format.includes('maya')) return '#00C25A';

    // Fallback colors for banks not specified
    const fallbacks = ['#64748b', '#78716c', '#0f766e', '#0369a1', '#6d28d9', '#be123c', '#c2410c'];

    // Generate a consistent pseudo-random color based on the string length and char codes
    let hash = 0;
    for (let i = 0; i < format.length; i++) {
        hash = format.charCodeAt(i) + ((hash << 5) - hash);
    }
    return fallbacks[Math.abs(hash) % fallbacks.length];
}

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
    reunion: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
    workshop: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    conference: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    networking: 'https://localhost:3000/events-networking.jpg',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    virtual: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1200&q=80',
};

export function getEventImage(event: any): string {
    const rawImage = event?.eventImage || event?.image;
    if (
        rawImage &&
        typeof rawImage === 'string' &&
        rawImage.trim() !== '' &&
        !rawImage.includes('events-image.jpg')
    ) {
        return rawImage;
    }

    const category = (
        event?.eventCategory?.eventCategoryName ||
        event?.category ||
        ''
    ).toLowerCase().trim();

    return CATEGORY_DEFAULT_IMAGES[category] || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
}
