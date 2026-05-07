const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src/app/components');

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.ts')) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('FontAwesomeModule') && !content.includes("from '@fortawesome/angular-fontawesome'")) {
                console.log(`MISSING IMPORT in ${filePath}`);
            }
        }
    });
}

walk(componentsDir);
