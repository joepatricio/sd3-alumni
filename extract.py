import re

with open('src/app/pages/admin/AdminDonations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_match = re.search(r'import \{.*\} from \'react\';.*?const STATUS_COLORS: Record<string, string> = \{.*?};\n\n', content, re.DOTALL)
imports = import_match.group(0)

dashboard_state_match = re.search(r'    const printRef = useRef<HTMLDivElement>\(null\);\n.*?    const handleBankLegendClick = \(e: any\) => \{\n        setActiveBank\(prev => prev === e\.value \? null : e\.value\);\n    };\n', content, re.DOTALL)
dashboard_state = dashboard_state_match.group(0)

dashboard_render_match = re.search(r'        <div className="flex justify-between items-center mb-6">.*?                </div>\n            \)}\n', content, re.DOTALL)
dashboard_render = dashboard_render_match.group(0)

dashboard_content = imports + "\nexport function DonationDashboard() {\n" + dashboard_state + "\n    useEffect(() => {\n        fetchStats();\n    }, []);\n\n    return (\n        <div className=\"dashboard-container\">\n" + dashboard_render + "\n        </div>\n    );\n}\n"

with open('src/app/components/admin/DonationDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(dashboard_content)

print('Extracted DonationDashboard.tsx successfully')
