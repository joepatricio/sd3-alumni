import re
import os

with open('src/app/pages/admin/AdminDonations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add itemsPerPage and replace ITEMS_PER_PAGE
content = content.replace('const ITEMS_PER_PAGE = 20;', 'const [itemsPerPage, setItemsPerPage] = useState(20);')
content = content.replace('Math.ceil(totalDonations / ITEMS_PER_PAGE)', 'Math.ceil(totalDonations / itemsPerPage)')

# Update fetch params to use itemsPerPage instead of ITEMS_PER_PAGE
content = content.replace('_per_page: ITEMS_PER_PAGE', '_per_page: itemsPerPage')

# Update dependency array of the useEffect that calls fetchDonations()
# It was [currentPage, activeTab, appliedSearchDonor, appliedSearchRef, appliedMinAmount, appliedMaxAmount, appliedStartDate, appliedEndDate, appliedSearchBankName, sortConfig]
content = re.sub(r'\}, \[currentPage, activeTab, appliedSearchDonor, appliedSearchRef, appliedMinAmount, appliedMaxAmount, appliedStartDate, appliedEndDate, appliedSearchBankName, sortConfig\]\);',
                 '}, [currentPage, itemsPerPage, activeTab, appliedSearchDonor, appliedSearchRef, appliedMinAmount, appliedMaxAmount, appliedStartDate, appliedEndDate, appliedSearchBankName, sortConfig]);', content)

# Move pagination controls
# The pagination controls are currently at the bottom of the table
pagination_jsx = '''                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-sm font-medium px-2">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>'''

# Remove from bottom
content = content.replace(pagination_jsx, '')

# Add to top, next to filters and matching transactions
# Currently looks like:
#                        <div className="flex justify-between items-center">
#                            <div className="text-sm font-medium text-gray-700">Filters</div>
#                            {!isTableLoading && (
#                                <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 cursor-default">
#                                    {totalDonations} matching transactions
#                                </Badge>
#                            )}
#                        </div>

new_header = '''                        <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-gray-700">Filters</div>
                            {!isTableLoading && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Rows per page:</span>
                                        <Select value={itemsPerPage.toString()} onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}>
                                            <SelectTrigger className="w-[80px] h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[10, 20, 50, 100].map(v => <SelectItem key={v} value={v.toString()}>{v}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="text-sm font-medium px-2">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 cursor-default">
                                        {totalDonations} matching transactions
                                    </Badge>
                                </div>
                            )}
                        </div>'''

content = content.replace('''                        <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-gray-700">Filters</div>
                            {!isTableLoading && (
                                <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 cursor-default">
                                    {totalDonations} matching transactions
                                </Badge>
                            )}
                        </div>''', new_header)

# 2. Date-fns integration
# Replace applyQuickFilter logic
old_quick_filter = '''    const applyQuickFilter = (filter: string) => {
        let start = '';
        let end = '';
        const now = new Date();

        if (filter === 'this_week') {
            const firstDay = now.getDate() - now.getDay();
            const first = new Date(now.setDate(firstDay));
            const last = new Date(first);
            last.setDate(last.getDate() + 6);
            start = first.toISOString().split('T')[0];
            end = last.toISOString().split('T')[0];
        } else if (filter === 'this_month') {
            const first = new Date(now.getFullYear(), now.getMonth(), 1);
            const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            start = first.toISOString().split('T')[0];
            end = last.toISOString().split('T')[0];
        } else if (filter === 'this_year') {
            const first = new Date(now.getFullYear(), 0, 1);
            const last = new Date(now.getFullYear(), 11, 31);
            start = first.toISOString().split('T')[0];
            end = last.toISOString().split('T')[0];
        } else if (filter === 'all') {
            start = '';
            end = '';
        }

        setStartDate(start);
        setEndDate(end);
    };'''

new_quick_filter = '''    const applyQuickFilter = (filter: string) => {
        let start = '';
        let end = '';
        const now = new Date();

        if (filter === 'this_week') {
            start = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            end = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        } else if (filter === 'this_month') {
            start = format(startOfMonth(now), 'yyyy-MM-dd');
            end = format(endOfMonth(now), 'yyyy-MM-dd');
        } else if (filter === 'this_year') {
            start = format(startOfYear(now), 'yyyy-MM-dd');
            end = format(endOfYear(now), 'yyyy-MM-dd');
        } else if (filter === 'all') {
            start = '';
            end = '';
        }

        setStartDate(start);
        setEndDate(end);
    };'''
content = content.replace(old_quick_filter, new_quick_filter)


with open('src/app/pages/admin/AdminDonations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Restored features to AdminDonations.tsx successfully')
