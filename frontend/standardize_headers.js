const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src/app/components');

const iconMapping = {
    'stop': 'faCircleH',
    'line': 'faRoute',
    'vehicle': 'faBus',
    'destination': 'faLocationCrosshairs',
    'rec-anr': 'faVolumeHigh',
    'bhof': 'faBuilding',
    'rec-om': 'faMapMarkerAlt',
    'rec-sel': 'faRoute',
    'rec-umlauf': 'faBus',
    'rec-frt': 'faBus',
    'rec-ueb': 'faRoute',
    'connection': 'faExchangeAlt',
    'rec-bereich': 'faLayerGroup',
    'rec-fgr': 'faClock',
    'rec-fzt': 'faTableList',
    'announcement': 'faBullhorn',
    'special-character': 'faFont'
};

function getIconForFile(filename) {
    for (const [key, icon] of Object.entries(iconMapping)) {
        if (filename.toLowerCase().includes(key)) return icon;
    }
    return null;
}

const standardHeaderBg = 'flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50';

function processHtmlFile(filePath, iconName) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const headerSearch = /<div class="flex items-center justify-between p-4 border-b border-slate-100[^>]*">/g;
    if (headerSearch.test(content)) {
        // Only attempt replacement if we haven't already standardized it
        if (!content.includes('bg-blue-50 dark:bg-blue-900/30')) {
            // Pattern 1: Simple list headers
            const listHeaderRegex = /<div class="flex items-center gap-[34]">([\s\S]*?)<div (?:class="w-10 h-10[^>]*"|class="p-2[^>]*")>([\s\S]*?)<\/div>/;
            if (listHeaderRegex.test(content)) {
                content = content.replace(/<div class="flex items-center justify-between p-4 border-b border-slate-100[^>]*">([\s\S]*?)<div class="flex items-center gap-[34]">/, (match) => {
                    return `<div class="${standardHeaderBg}">\n        <div class="flex items-center gap-3">`;
                });
                content = content.replace(/<div (?:class="w-10 h-10[^>]*"|class="p-2[^>]*")>[\s\S]*?<\/div>/, `<div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">\n                <fa-icon [icon]="${iconName}" class="text-xl"></fa-icon>\n            </div>`);
                changed = true;
            }

            // Pattern 2: Detail headers with back button
            const detailHeaderRegex = /<div class="flex items-center gap-[34]">([\s\S]*?)<a routerLink="([^"]*)">([\s\S]*?)<\/a>/;
            if (detailHeaderRegex.test(content) && !content.includes(`[icon]="${iconName}"`)) {
                content = content.replace(/<div class="flex items-center justify-between p-4 border-b border-slate-100[^>]*">([\s\S]*?)<div class="flex items-center gap-[34]">([\s\S]*?)<a routerLink="([^"]*)">([\s\S]*?)<\/a>/, (match, before, gap, link, linkContent) => {
                    return `<div class="${standardHeaderBg}">\n        <div class="flex items-center gap-4">\n            <a routerLink="${link}">${linkContent}</a>\n            <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">\n                <fa-icon [icon]="${iconName}" class="text-xl"></fa-icon>\n            </div>`;
                });
                changed = true;
            }
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated HTML: ${filePath}`);
    }
}

function processTsFile(filePath, iconName) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Ensure FontAwesomeModule is imported
    if (!content.includes("'@fortawesome/angular-fontawesome'")) {
        content = `import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';\n` + content;
        changed = true;
    }

    // 2. Ensure the specific icon is imported
    if (!content.includes(` ${iconName} `) || !content.includes("'@fortawesome/free-solid-svg-icons'")) {
        if (content.includes("'@fortawesome/free-solid-svg-icons'")) {
            content = content.replace(/import\s*{([^}]*)}\s*from\s*['"]@fortawesome\/free-solid-svg-icons['"]?;?/, (match, imports) => {
                if (imports.includes(iconName)) return match;
                return `import { ${imports.trim().replace(/\n/g, ' ')}, ${iconName} } from '@fortawesome/free-solid-svg-icons';`;
            });
        } else {
            content = `import { ${iconName} } from '@fortawesome/free-solid-svg-icons';\n` + content;
        }
        changed = true;
    }

    // 3. Ensure the icon property exists in the class
    if (!content.match(new RegExp(`${iconName}\\s*=\\s*${iconName}`))) {
        content = content.replace(/export class ([^{]*) {/, (match) => {
            return `${match}\n    ${iconName} = ${iconName};`;
        });
        changed = true;
    }

    // 4. Ensure FontAwesomeModule is in the imports array
    content = content.replace(/imports:\s*\[([\s\S]*?)\]/, (match, imports) => {
        if (imports.includes('FontAwesomeModule')) return match;
        return `imports: [\n        FontAwesomeModule,${imports}\n    ]`;
    });

    if (content !== fs.readFileSync(filePath, 'utf8')) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated TS: ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath);
        } else {
            const iconName = getIconForFile(file);
            if (iconName) {
                if (file.endsWith('.component.html')) {
                    processHtmlFile(filePath, iconName);
                } else if (file.endsWith('.component.ts')) {
                    processTsFile(filePath, iconName);
                }
            }
        }
    });
}

walk(componentsDir);
