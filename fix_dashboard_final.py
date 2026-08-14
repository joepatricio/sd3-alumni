import re

with open('src/app/components/admin/DonationDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove unused imports
content = re.sub(r"import \{ startOfWeek.*?\} from 'date-fns';\n", "", content)
content = re.sub(r"import \{ Badge \} from '@components/ui/badge';\n", "", content)
content = re.sub(r"import \{ Tabs, TabsList, TabsTrigger \} from '@components/ui/tabs';\n", "", content)
content = re.sub(r"import \{ Input \} from '@components/ui/input';\n", "", content)
content = re.sub(r"import \{ Select, SelectContent, SelectItem, SelectTrigger, SelectValue \} from '@components/ui/select';\n", "", content)
content = re.sub(r"import \{ Printer, Download, Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, Info, Mail, MapPin, GraduationCap, Briefcase \} from 'lucide-react';\n", "import { Printer, Info, Mail, MapPin, GraduationCap, Briefcase } from 'lucide-react';\n", content)

# Remove unused vars from imports
content = content.replace("CardDescription", "")

# Remove table filter states
content = re.sub(r'    const \[activeTab, setActiveTab\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[searchDonor, setSearchDonor\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[searchRef, setSearchRef\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[minAmount, setMinAmount\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[maxAmount, setMaxAmount\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[startDate, setStartDate\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[endDate, setEndDate\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[searchBankName, setSearchBankName\] = useState.*?;\n', '', content)

content = re.sub(r'    const \[appliedSearchDonor, setAppliedSearchDonor\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[appliedSearchRef, setAppliedSearchRef\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[appliedMinAmount, setAppliedMinAmount\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[appliedMaxAmount, setAppliedMaxAmount\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[appliedStartDate, setAppliedStartDate\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[appliedEndDate, setAppliedEndDate\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[appliedSearchBankName, setAppliedSearchBankName\] = useState.*?;\n', '', content)

content = re.sub(r'    const \[sortConfig, setSortConfig\] = useState.*?;\n', '', content)

# Remove unused donations list
content = re.sub(r'    const \[donations, setDonations\] = useState<Donation\[\]>\(\[\]\);\n', '', content)
content = re.sub(r'    const \[totalDonations, setTotalDonations\] = useState\(0\);\n', '', content)
content = re.sub(r'    const \[currentPage, setCurrentPage\] = useState\(1\);\n', '', content)

# Remove fetchDonations and handleApplyFilters entirely
content = re.sub(r'    const fetchDonations = async \(\) => \{.*?\n    \};\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const handleApplyFilters = \(\) => \{.*?\n    \};\n', '', content, flags=re.DOTALL)
content = re.sub(r'    useEffect\(\(\) => \{\n        fetchDonations\(\);\n    \}, \[.*?\]\);\n', '', content, flags=re.DOTALL)

with open('src/app/components/admin/DonationDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Cleaned DonationDashboard.tsx')
