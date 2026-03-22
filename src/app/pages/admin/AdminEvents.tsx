import { AdminContentTable } from '@components/admin/AdminContentTable';
import type { ContentItem } from '@components/admin/AdminContentTable';
import { events } from '@assets/mockData';
import { useState } from 'react';

export function AdminEvents() {
    // Map mockData events to ContentItem format
    const [eventsData, setEventsData] = useState<ContentItem[]>(() =>
        events.map(e => ({
            id: e.id,
            title: e.title,
            author: typeof e.organizer === 'object' && e.organizer !== null ? (e.organizer as any).name : 'Organization',
            date: e.date,
            type: 'Event',
            status: e.status || "Pending",
            description: e.description,
            rawDate: new Date(e.date).getTime()
        }))
    );

    const handleStatusChange = (id: string, newStatus: "Approved" | "Rejected" | "Pending") => {
        setEventsData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        
        // Mutate the original mock array so it persists for other components
        const eventIndex = events.findIndex(e => e.id === id);
        if (eventIndex !== -1) {
            events[eventIndex].status = newStatus;
        }

        // Save back to mock file physically
        fetch('/api/update-status', {
            method: 'POST',
            body: JSON.stringify({ type: 'Event', id, status: newStatus })
        }).catch(err => console.error('Failed to update file:', err));
    };

    return (
        <AdminContentTable
            title="Events Management"
            description="Review, approve, or reject user-submitted networking and community events."
            contentType="Event"
            mockData={eventsData}
            primaryColorClass="bg-[#1a5f3f] hover:bg-[#154d33] text-white"
            outlineColorClass="text-[#1a5f3f] border-[#1a5f3f] hover:bg-[#1a5f3f]/10"
            onStatusChange={handleStatusChange}
        />
    );
}
