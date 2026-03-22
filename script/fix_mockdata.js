const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/assets/mockData.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace `id: 1,` with `id: '1',`
content = content.replace(/id:\s*(\d+)/g, "id: '$1'");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('mockData IDs fixed!');
