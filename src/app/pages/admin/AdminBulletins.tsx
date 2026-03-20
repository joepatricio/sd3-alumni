import { AdminContentTable } from '@components/admin/AdminContentTable';
import type { ContentItem } from '@components/admin/AdminContentTable';
import { bulletins } from '@assets/mockData';
import { useState } from 'react';

export function AdminBulletins() {
    // Map mockData bulletins to ContentItem format
    const [bulletinsData, setBulletinsData] = useState<ContentItem[]>(() =>
        bulletins.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author.name,
            date: b.date,
            type: 'Bulletin',
            status: b.status || "Pending",
            description: b.preview || '',
            rawDate: new Date(b.date).getTime()
        }))
    );

    const handleStatusChange = (id: number | string, newStatus: "Approved" | "Rejected" | "Pending") => {
        setBulletinsData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        
        // Mutate the original mock array so it persists for other components
        const bulletinIndex = bulletins.findIndex(b => b.id === id);
        if (bulletinIndex !== -1) {
            bulletins[bulletinIndex].status = newStatus;
        }

        // Save back to mock file physically
        fetch('/api/update-status', {
            method: 'POST',
            body: JSON.stringify({ type: 'Bulletin', id, status: newStatus })
        }).catch(err => console.error('Failed to update file:', err));
    };

    return (
        <AdminContentTable
            title="Bulletins Management"
            description="Review, approve, or reject user-submitted job postings and community announcements."
            contentType="Bulletin"
            mockData={bulletinsData}
            primaryColorClass="bg-blue-600 hover:bg-blue-700 text-white"
            outlineColorClass="text-blue-600 border-blue-200 hover:bg-blue-50"
            onStatusChange={handleStatusChange}
        />
    );
}
