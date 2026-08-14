import re

with open('src/app/pages/admin/AdminDonations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for DonationDashboard
if "import { DonationDashboard }" not in content:
    content = content.replace("import { LazyImage } from '@/app/components/user/LazyImage';", "import { LazyImage } from '@/app/components/user/LazyImage';\nimport { DonationDashboard } from '@/app/components/admin/DonationDashboard';")

# Remove dashboard render
# Replace from <style type="text/css"> down to the closing </div> of the dashboard
dashboard_start = content.find('<style type="text/css">')
table_start = content.find('<Card className="border-none shadow-md print:hidden">')

if dashboard_start != -1 and table_start != -1:
    content = content[:dashboard_start] + '<DonationDashboard />\n\n            ' + content[table_start:]

with open('src/app/pages/admin/AdminDonations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Cleaned AdminDonations.tsx successfully')
