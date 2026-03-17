import { adminContentMock } from '@assets/adminMockData';
import { AdminContentTable } from '@components/admin/AdminContentTable';
import type { ContentItem } from '@components/admin/AdminContentTable';

export function AdminBulletins() {
    return (
        <AdminContentTable
            title="Bulletins Management"
            description="Review, approve, or reject user-submitted job postings and community announcements."
            contentType="Bulletin"
            mockData={adminContentMock as ContentItem[]}
            primaryColorClass="bg-blue-600 hover:bg-blue-700 text-white"
            outlineColorClass="text-blue-600 border-blue-200 hover:bg-blue-50"
        />
    );
}
