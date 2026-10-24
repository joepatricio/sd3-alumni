const fs = require('fs');

const files = [
  'src/app/pages/admin/AdminDonations.tsx',
  'src/app/pages/admin/AdminDashboard.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file + '.backup', content);

  content = content.replace(/import\s+\{\s*(?:Card|CardContent|CardHeader|CardTitle|CardDescription|CardFooter|CardAction|,\s*)+\s*\}\s+from\s+['"]@components\/ui\/card['"];?/g, '');

  content = content.replace(/<Card\b(?:\s+className=["']([^"']*)["'])?([^>]*)>/g, (match, p1, p2) => {
    const cls = p1 ? 'bg-white rounded-xl border border-gray-200 ' + p1 : 'bg-white rounded-xl border border-gray-200';
    return `<div className="${cls}" ${p2 || ''}>`;
  });
  content = content.replace(/<\/Card>/g, '</div>');

  content = content.replace(/<CardHeader\b(?:\s+className=["']([^"']*)["'])?([^>]*)>/g, (match, p1, p2) => {
    const cls = p1 ? 'flex flex-col space-y-1.5 px-6 pt-6 ' + p1 : 'flex flex-col space-y-1.5 px-6 pt-6';
    return `<div className="${cls}" ${p2 || ''}>`;
  });
  content = content.replace(/<\/CardHeader>/g, '</div>');

  content = content.replace(/<CardContent\b(?:\s+className=["']([^"']*)["'])?([^>]*)>/g, (match, p1, p2) => {
    const cls = p1 ? 'px-6 pb-6 ' + p1 : 'px-6 pb-6';
    return `<div className="${cls}" ${p2 || ''}>`;
  });
  content = content.replace(/<\/CardContent>/g, '</div>');

  content = content.replace(/<CardTitle\b(?:\s+className=["']([^"']*)["'])?([^>]*)>/g, (match, p1, p2) => {
    const cls = p1 ? 'font-semibold leading-none tracking-tight ' + p1 : 'font-semibold leading-none tracking-tight';
    return `<h4 className="${cls}" ${p2 || ''}>`;
  });
  content = content.replace(/<\/CardTitle>/g, '</h4>');

  content = content.replace(/<CardDescription\b(?:\s+className=["']([^"']*)["'])?([^>]*)>/g, (match, p1, p2) => {
    const cls = p1 ? 'text-sm text-gray-500 ' + p1 : 'text-sm text-gray-500';
    return `<p className="${cls}" ${p2 || ''}>`;
  });
  content = content.replace(/<\/CardDescription>/g, '</p>');

  fs.writeFileSync(file, content);
}
console.log('Replaced all Card components in AdminDonations and AdminDashboard.');
