export const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return dateString;
    }
};

export const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch {
        return dateString;
    }
};
