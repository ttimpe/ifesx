const fs = require('fs');
const file = 'src/app/components/layout/sidebar/sidebar.component.html';
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Add 'active-nav-link' to all routerLinkActive directives
    // Example: routerLinkActive="bg-blue-600 text-white shadow-md shadow-blue-900/20"
    content = content.replace(/routerLinkActive=\"([^\"]+)\"/g, 'routerLinkActive=\"$1 active-nav-link\"');
    fs.writeFileSync(file, content, 'utf8');
}

const cssFile = 'src/app/components/layout/sidebar/sidebar.component.css';
if (fs.existsSync(cssFile)) {
    let cssContent = fs.readFileSync(cssFile, 'utf8');
    if (!cssContent.includes('.active-nav-link fa-icon')) {
        cssContent += '\n\n/* Force white icons on active navigation links */\n.active-nav-link fa-icon,\n.active-nav-link fa-icon svg {\n  color: white !important;\n}\n';
        fs.writeFileSync(cssFile, cssContent, 'utf8');
    }
} else {
    fs.writeFileSync(cssFile, '/* Force white icons on active navigation links */\n.active-nav-link fa-icon,\n.active-nav-link fa-icon svg {\n  color: white !important;\n}\n', 'utf8');
}

console.log('Fixed sidebar active icons.');
