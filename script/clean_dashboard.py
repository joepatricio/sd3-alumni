import re

with open('src/app/components/admin/DonationDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Rename AdminDonations to DonationDashboard
content = content.replace('export function AdminDonations() {', 'export function DonationDashboard() {')

# 2. Remove the table section
# Find <Card className="border-none shadow-md print:hidden"> and remove up to </div>\n    );\n}
table_start = content.find('<Card className="border-none shadow-md print:hidden">')
if table_start != -1:
    content = content[:table_start] + '        </div>\n    );\n}\n'

# 3. Write back to file
with open('src/app/components/admin/DonationDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Cleaned DonationDashboard.tsx successfully')
