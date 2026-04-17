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
