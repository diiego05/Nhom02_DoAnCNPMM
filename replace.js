const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const oldContent = content;

    content = content.replace(/shadow-brutal/g, 'shadow-premium');
    content = content.replace(/shadow-subtle/g, 'shadow-soft');
    content = content.replace(/border-4 border-black/g, 'border border-gray-100');
    content = content.replace(/border-\[3px\] border-black/g, 'border border-gray-100');
    content = content.replace(/border-2 border-black/g, 'border border-gray-100');
    content = content.replace(/border-b-2 border-black/g, 'border-b border-gray-100');
    content = content.replace(/border-t-2 border-black/g, 'border-t border-gray-100');
    content = content.replace(/border-l-2 border-black/g, 'border-l border-gray-100');
    content = content.replace(/border-r-2 border-black/g, 'border-r border-gray-100');
    content = content.replace(/btn-brutal/g, 'btn-modern');
    content = content.replace(/input-brutal/g, 'input-modern');
    content = content.replace(/badge-brutal/g, 'badge-modern');

    if (content !== oldContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
}

function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
        const fullPath = path.join(currentPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir(dir);
console.log('Done');
