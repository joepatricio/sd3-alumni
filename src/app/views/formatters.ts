export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
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
