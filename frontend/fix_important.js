const fs = require('fs');
const path = require('path');
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
const htmlFiles = walk(path.join(process.cwd(), 'src', 'app'));
let total = 0;
htmlFiles.forEach(file => {
    let text = fs.readFileSync(file, 'utf8');
    let orig = text;
    text = text.replace(/!bg-white dark:bg-slate-800/g, '!bg-white dark:!bg-slate-800');
    if (text !== orig) {
        fs.writeFileSync(file, text);
        total++;
    }
});
console.log('Fixed !bg-white in ' + total + ' files');
