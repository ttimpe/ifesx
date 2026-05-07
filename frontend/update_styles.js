const fs = require('fs');
const path = require('path');

const mappings = [
    { regex: /(?<!dark:)bg-white/g, replacement: 'bg-white dark:bg-slate-800' },
    { regex: /(?<!dark:)bg-slate-50(?!\/)/g, replacement: 'bg-slate-50 dark:bg-slate-900' },
    { regex: /(?<!dark:)bg-slate-100(?!\/)/g, replacement: 'bg-slate-100 dark:bg-slate-800' },
    { regex: /(?<!dark:)bg-slate-200(?!\/)/g, replacement: 'bg-slate-200 dark:bg-slate-700' },
    { regex: /(?<!dark:)text-slate-800/g, replacement: 'text-slate-800 dark:text-slate-100' },
    { regex: /(?<!dark:)text-slate-700/g, replacement: 'text-slate-700 dark:text-slate-200' },
    { regex: /(?<!dark:)text-slate-600/g, replacement: 'text-slate-600 dark:text-slate-300' },
    { regex: /(?<!dark:)text-slate-500/g, replacement: 'text-slate-500 dark:text-slate-400' },
    { regex: /(?<!dark:)border-slate-200/g, replacement: 'border-slate-200 dark:border-slate-700' },
    { regex: /(?<!dark:)border-slate-100/g, replacement: 'border-slate-100 dark:border-slate-700' },
    { regex: /(?<!dark:)border-slate-300/g, replacement: 'border-slate-300 dark:border-slate-600' },
    { regex: /(?<!dark:)bg-blue-50(?!\/)/g, replacement: 'bg-blue-50 dark:bg-blue-900/30' },
    { regex: /(?<!dark:)border-blue-100/g, replacement: 'border-blue-100 dark:border-blue-800' },
    { regex: /(?<!dark:)text-blue-500/g, replacement: 'text-blue-500 dark:text-blue-400' },
    { regex: /(?<!dark:)text-blue-600/g, replacement: 'text-blue-600 dark:text-blue-400' },
    { regex: /(?<!dark:)bg-slate-50\/50/g, replacement: 'bg-slate-50/50 dark:bg-slate-900/50' },
    { regex: /(?<!dark:)bg-blue-50\/50/g, replacement: 'bg-blue-50/50 dark:bg-blue-900/50' },
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const htmlFiles = walk(path.join(__dirname, 'src', 'app'));

let totalModified = 0;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    mappings.forEach(mapping => {
        content = content.replace(mapping.regex, mapping.replacement);
    });

    // Cleanup double classes
    content = content.replace(/dark:bg-slate-\d+\s+dark:bg-slate-\d+/g, (match) => match.split(/\s+/)[0]);
    content = content.replace(/dark:text-slate-\d+\s+dark:text-slate-\d+/g, (match) => match.split(/\s+/)[0]);
    content = content.replace(/dark:border-slate-\d+\s+dark:border-slate-\d+/g, (match) => match.split(/\s+/)[0]);

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        totalModified++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Total HTML files modified: ${totalModified}`);

const cssFiles = walk(path.join(__dirname, 'src', 'app')).filter(f => f.endsWith('.css'));
cssFiles.forEach(file => {
    // some components have explicit white backgrounds in CSS?
});
