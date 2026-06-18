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
