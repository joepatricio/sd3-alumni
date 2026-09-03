import re

with open('src/app/pages/admin/AdminDonations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove unused states
content = re.sub(r'    const \[isStatsLoading, setIsStatsLoading\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[summaryTimeDate, setSummaryTimeDate\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[stats, setStats\] = useState\(.*?\}\);\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const \[statusData, setStatusData\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[bankData, setBankData\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[leaderboards, setLeaderboards\] = useState\(.*?\}\);\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const \[activeLeaderboardTab, setActiveLeaderboardTab\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[activeStatus, setActiveStatus\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[activeBank, setActiveBank\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[isExporting, setIsExporting\] = useState\(false\);\n', '', content)
content = re.sub(r'    const printRef = useRef<HTMLDivElement>\(null\);\n', '', content)

# Remove unused functions
content = re.sub(r'    const fetchStats = .*?\n    };\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const handleStatusLegendClick = .*?\n    };\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const handleBankLegendClick = .*?\n    };\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const renderCustomTooltip = .*?\n    };\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const handlePrintReport = .*?\n    };\n', '', content, flags=re.DOTALL)

# Fix ITEMS_PER_PAGE reference
content = content.replace('Math.ceil(totalDonations / ITEMS_PER_PAGE)', 'Math.ceil(totalDonations / itemsPerPage)')

# Also need to remove the initial useEffect for fetchStats
# Since there is one useEffect for fetchStats() and one for fetchDonations()
# Let's just find and replace the useEffect for fetchStats
content = re.sub(r'    useEffect\(\(\) => \{\n        fetchStats\(\);\n    \}, \[\]\);\n', '', content)

with open('src/app/pages/admin/AdminDonations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed AdminDonations.tsx successfully')
