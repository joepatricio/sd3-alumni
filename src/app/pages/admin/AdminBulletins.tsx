import { AdminContentTable } from '@components/admin/AdminContentTable';
import { api } from '@/app/views/api';

export function AdminBulletins() {
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
            else if (sortKey === 'date' || sortKey === 'rawDate') sortKey = 'bulletinDate';
            else if (sortKey === 'status') sortKey = 'status.statusName';

            sortStr = params.sort.direction === 'desc' ? `-${sortKey}` : sortKey;
        }

        const response = await api.get('/admin/bulletins', {
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

        const mappedBulletins = data.map((b: any) => ({
            id: b.id,
            title: b.title,
            author: b.author?.profile?.userName || 'Unknown',
            date: b.bulletinDate,
            type: 'Bulletin',
            status: b.status?.statusName || "Pending",
            description: b.content || '',
            rawDate: new Date(b.bulletinDate).getTime()
        }));

        return { data: mappedBulletins, total };
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/admin/bulletins/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('adminToken')}` }
            });
            window.location.reload();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    return (
        <AdminContentTable
            title="Bulletins Management"
            description="Review, approve, or reject user-submitted job postings and community announcements."
            contentType="Bulletin"
            fetchData={fetchData}
            primaryColorClass="bg-blue-600 hover:bg-blue-700 text-white"
            outlineColorClass="text-blue-600 border-blue-200 hover:bg-blue-50"
            onStatusChange={handleStatusChange}
        />
    );
}
