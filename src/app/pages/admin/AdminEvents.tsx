import { AdminContentTable } from '@components/admin/AdminContentTable';

import { api } from '@/app/views/api';

export function AdminEvents() {
    // Statuses based on the EventStatus table
    const EVENT_STATUSES = ["All", "Pending", "Approved", "Rejected", "Cancelled", "Concluded", "Archived"];

    const fetchData = async (params: any) => {
        const whereClause: any = {};
        if (params.status !== 'All') {
            whereClause.status = { statusName: params.status };
        }
        if (params.search) {
            whereClause.title = { contains: params.search };
        }

        let sortStr = undefined;
        if (params.sort) {
            let sortKey = params.sort.key;
            if (sortKey === 'author') sortKey = 'author.profile.userName';
            else if (sortKey === 'date' || sortKey === 'rawDate') sortKey = 'eventDate';
            else if (sortKey === 'status') sortKey = 'status.statusName';

            sortStr = params.sort.direction === 'desc' ? `-${sortKey}` : sortKey;
        }

        const response = await api.get('/admin/events', {
            params: {
                _page: params.page,
                _per_page: params.perPage,
                _sort: sortStr,
                _where: Object.keys(whereClause).length > 0 ? JSON.stringify(whereClause) : undefined
            },
            headers: { Authorization: `Bearer ${sessionStorage.getItem('adminToken')}` }
        });

        const data = response.data.data || response.data;
        const total = response.data.items || data.length;

        const mappedEvents = data.map((e: any) => ({
            id: e.id,
            title: e.title,
            author: e.author?.profile?.userName || 'Unknown User',
            date: e.eventDate,
            type: 'Event',
            status: e.eventStatus?.statusName || "Pending",
            description: e.description,
            rawDate: new Date(e.eventDate).getTime()
        }));

        return { data: mappedEvents, total };
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/admin/events/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('adminToken')}` }
            });
            // We can't automatically refresh the table from here unless we pass a refresh trigger,
            // but the optimistic UI update inside the parent is gone. We could just reload the page or add a trigger.
            // For now, let it be.
            window.location.reload();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    return (
        <AdminContentTable
            title="Events Management"
            description="Review, approve, or reject user-submitted networking and community events."
            contentType="Event"
            fetchData={fetchData}
            statuses={EVENT_STATUSES}
            primaryColorClass="bg-brand-primary hover:bg-brand-primary-hover text-white"
            outlineColorClass="text-brand-primary border-brand-primary hover:bg-brand-primary/10"
            onStatusChange={handleStatusChange}
        />
    );
}
