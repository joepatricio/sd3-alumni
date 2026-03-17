import { adminContentMock } from '@assets/adminMockData';
import { AdminContentTable } from '@components/admin/AdminContentTable';
import type { ContentItem } from '@components/admin/AdminContentTable';

export function AdminEvents() {
    return (
        <AdminContentTable
            title="Events Management"
            description="Review, approve, or reject user-submitted networking and community events."
            contentType="Event"
            mockData={adminContentMock as ContentItem[]}
            primaryColorClass="bg-[#1a5f3f] hover:bg-[#154d33] text-white"
            outlineColorClass="text-[#1a5f3f] border-[#1a5f3f] hover:bg-[#1a5f3f]/10"
        />
    );
}
