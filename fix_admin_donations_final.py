import re

with open('src/app/pages/admin/AdminDonations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix ITEMS_PER_PAGE -> itemsPerPage in the bottom text
content = content.replace('ITEMS_PER_PAGE', 'itemsPerPage')

# Remove unused imports
content = re.sub(r"import \{.*?\} from 'lucide-react';\n", "import { Download, Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';\n", content)
content = re.sub(r"import \{ formatCurrency, getBankColor, formatDate \} from '@/app/views/formatters';\n", "import { formatCurrency, formatDate } from '@/app/views/formatters';\n", content)
content = content.replace("import { useState, useEffect, useRef } from 'react';", "import { useState, useEffect } from 'react';")

content = re.sub(r"import \{ PieChart.*?\} from 'recharts';\n", '', content)
content = re.sub(r"import \{ Link \} from 'react-router-dom';\n", '', content)
content = re.sub(r"import \{ toPng \} from 'html-to-image';\n", '', content)
content = re.sub(r"import \{ LazyImage \} from '@/app/components/user/LazyImage';\n", '', content)

# Remove STATUS_COLORS
content = re.sub(r'const STATUS_COLORS: Record<string, string> = \{.*?\};\n\n', '', content, flags=re.DOTALL)

# Remove unused state variables
content = re.sub(r'    const \[leaderboards, setLeaderboards\] = useState.*?;\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const \[uniqueBanks, setUniqueBanks\] = useState.*?;\n', '', content)
content = re.sub(r'    const \[dbStatuses, setDbStatuses\] = useState.*?;\n', '', content)

with open('src/app/pages/admin/AdminDonations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Cleaned AdminDonations.tsx')
