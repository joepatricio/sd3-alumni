import re

with open('src/app/components/admin/DonationDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove itemsPerPage, isTableLoading, uniqueBanks, dbStatuses, datePreset, amountPreset
content = re.sub(r'    const \[itemsPerPage, setItemsPerPage\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[isTableLoading, setIsTableLoading\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[uniqueBanks, setUniqueBanks\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[dbStatuses, setDbStatuses\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[datePreset, setDatePreset\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[amountPreset, setAmountPreset\] = useState.*?;\n', '', content)

# Remove unused functions
content = re.sub(r'    const handleSort = .*?\n    };\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const applyQuickFilter = .*?\n    };\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const applyAmountQuickFilter = .*?\n    };\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const renderSortIcon = .*?\n    };\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const handleExportCSV = .*?\n    };\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const handleClearFilters = .*?\n    };\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const onTabChange = .*?\n    };\n', '', content, flags=re.DOTALL)

# Remove pagination
content = re.sub(r'    const totalPages = .*?;\n', '', content)
content = re.sub(r'    const paginatedDonations = .*?;\n', '', content)

with open('src/app/components/admin/DonationDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed DonationDashboard.tsx successfully')
