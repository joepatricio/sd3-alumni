import { AdminContentTable } from '@components/admin/AdminContentTable';
import { api, unwrapListResponse, type BulletinData } from '@/app/views/api';
import type { ContentItem } from '@components/admin/AdminContentTable';

export function AdminBulletins() {
    const fetchData: React.ComponentProps<typeof AdminContentTable>['fetchData'] = async (params) => {
        const whereClause: Record<string, unknown> = {};
        if (params.status !== 'All') {
            if (params.status === 'For Review') {
                whereClause.status = { statusName: { in: ['Flagged', 'Pending'] } };
            } else {
                whereClause.status = { statusName: params.status };
            }
        }
        if (params.search) {
            whereClause.title = { contains: params.search };
        }
        const hasActiveAccountScope = params.accountScope && params.accountScope.length > 0 && !params.accountScope.includes('All');
        if (hasActiveAccountScope || params.searchAuthor) {
            whereClause.author = {} as Record<string, unknown>;
            if (params.searchAuthor) {
                (whereClause.author as Record<string, unknown>).profile = { userName: { contains: params.searchAuthor } };
            }
            if (hasActiveAccountScope) {
                (whereClause.author as Record<string, unknown>).userStatus = { statusName: { in: params.accountScope } };
            }
        }

        if (params.categories && params.categories.length > 0 && !params.categories.includes('All')) {
            whereClause.category = { bulletinCategoryName: { in: params.categories } };
        }
        if (params.searchStartDate || params.searchEndDate) {
            const dateClause: Record<string, unknown> = {};
            if (params.searchStartDate) {
                const start = new Date(params.searchStartDate);
                dateClause.gte = start.toISOString();
            }
            if (params.searchEndDate) {
                const end = new Date(params.searchEndDate);
                end.setDate(end.getDate() + 1); // include the end date entirely
                dateClause.lt = end.toISOString();
            }
            whereClause.bulletinDate = dateClause;
        }

        let sortStr = undefined;
        if (params.sort) {
            let sortKey = params.sort.key;
            if (sortKey === 'author') sortKey = 'author.profile.userName';
            else if (sortKey === 'date' || sortKey === 'rawDate') sortKey = 'bulletinDate';
            else if (sortKey === 'status') sortKey = 'status.statusName';

            sortStr = params.sort.direction === 'desc' ? `-${sortKey}` : sortKey;
        }

        // If on the 'For Review' tab, ensure we always group Flagged items first
        if (params.status === 'For Review') {
            if (sortStr && !sortStr.includes('status.statusName')) {
                sortStr = `status.statusName,${sortStr}`;
            } else if (!sortStr) {
                sortStr = 'status.statusName';
            }
        }

        const response = await api.get('/admin/bulletins', {
            params: {
                _page: params.page,
                _per_page: params.perPage,
                _sort: sortStr,
                _where: Object.keys(whereClause).length > 0 ? JSON.stringify(whereClause) : undefined
            }
        });

        const { items: data, total } = unwrapListResponse<BulletinData>(response);

        const mappedBulletins: ContentItem[] = data.map((b: BulletinData) => ({
            ...b,
            id: b.id,
            title: b.title,
            author: b.author?.profile?.userName || 'Unknown',
            date: b.bulletinDate,
            type: 'Bulletin',
            status: b.contentStatus?.statusName || "Pending",
            content: b.content || '',
            description: b.content || '',
            bulletinImage: b.bulletinImage || null,
            readTimeMinutes: b.readTimeMinutes || 5,
            category: b.bulletinCategory?.bulletinCategoryName || "Announcements",
            isOfficial: b.author?.userStatus?.statusName === 'Official',
            isBanned: b.author?.userStatus?.statusName === 'Banned',
            isSuspended: b.author?.userStatus?.statusName === 'Suspended',
            rawDate: new Date(b.bulletinDate).getTime()
        }));

        return { data: mappedBulletins, total };
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            // Get the old bulletin to check previous status and author
            await api.get(`/bulletins/${id}`);

            // Patch status
            await api.patch(`/admin/bulletins/${id}/status`, { status: newStatus });


        } catch (err) {
            console.error('Failed to update status:', err);
            throw err;
        }
    };

    return (
        <AdminContentTable
            title="Bulletins Management"
            description="Review, approve, or reject user-submitted and community announcements."
            contentType="Bulletin"
            fetchData={fetchData}
            statuses={["All", "For Review", "Pending", "Flagged", "Approved", "Rejected", "Archived"]}
            assignableStatuses={["Pending", "Flagged", "Approved", "Rejected", "Archived"]}
            primaryColorClass="bg-blue-600 hover:bg-blue-700 text-white"
            outlineColorClass="text-blue-600 border-blue-200 hover:bg-blue-50"
            categories={[
                "Announcements",
                "Careers",
                "Success Stories",
                "Donations",
                "Others"
            ]}
            onStatusChange={handleStatusChange}
        />
    );
}
