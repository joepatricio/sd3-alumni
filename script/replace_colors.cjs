// Helper script to facilitate rebrandings
const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

// Centralized color map (easy to expand)
// Add more colors as necessary (e.g. tints, secondary/tertiary colors, etc.)
const colorMap = {
    '#1a5f3f': '#d97706',
    '#2d7a4f': '#b45309',
    '#154e33': '#92400e',
};

function replaceColors(content) {
    let modified = content;

    for (const [from, to] of Object.entries(colorMap)) {
        const regex = new RegExp(from, 'gi');
        modified = modified.replace(regex, to);
    }

    return modified;
}

function findAndReplaceFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);

        if (fs.lstatSync(fullPath).isDirectory()) {
            findAndReplaceFiles(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const original = fs.readFileSync(fullPath, 'utf8');
            const updated = replaceColors(original);

            if (original !== updated) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

findAndReplaceFiles(directoryPath);
console.log('Color replacement complete.');