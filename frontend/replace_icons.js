const fs = require('fs');
const path = require('path');

const iconMap = [
    { dir: 'stop-detail', pi: 'pi-map-marker', fa: 'faCircleH' },
    { dir: 'line-detail', pi: 'pi-share-alt', fa: 'faRoute' },
    { dir: 'destination-detail', pi: 'pi-flag', fa: 'faLocationCrosshairs' },
    { dir: 'vehicle-detail', pi: 'pi-car', fa: 'faBus' },
    { dir: 'bhof-detail', pi: 'pi-building', fa: 'faBuilding' }
];

const componentsDir = path.join(__dirname, 'src', 'app', 'components');

iconMap.forEach(mapping => {
    const htmlFile = path.join(componentsDir, mapping.dir, `${mapping.dir}.component.html`);
    const tsFile = path.join(componentsDir, mapping.dir, `${mapping.dir}.component.ts`);

    if (fs.existsSync(htmlFile)) {
        let htmlContent = fs.readFileSync(htmlFile, 'utf8');
        // Replace <i class="pi pi-[icon] [other-classes]"></i> with <fa-icon [icon]="[fa-icon]" class="[other-classes]"></fa-icon>
        const regex = new RegExp(`(<i\\s+class="pi\\s+${mapping.pi}(.*?)"\\s*></i>)`, 'g');
        htmlContent = htmlContent.replace(regex, `<fa-icon [icon]="${mapping.fa}" class="$2"></fa-icon>`);
        fs.writeFileSync(htmlFile, htmlContent, 'utf8');
        console.log(`Updated HTML: ${htmlFile}`);
    }

    if (fs.existsSync(tsFile)) {
        let tsContent = fs.readFileSync(tsFile, 'utf8');

        // Ensure FontAwesomeModule is imported (it usually isn't in detail components unless they use it)
        if (!tsContent.includes('FontAwesomeModule')) {
            tsContent = tsContent.replace(/import { CommonModule }/, "import { CommonModule }\nimport { FontAwesomeModule } from '@fortawesome/angular-fontawesome';");
            tsContent = tsContent.replace(/imports: \[\s*/, "imports: [\n    FontAwesomeModule,\n    ");
        }

        if (!tsContent.includes(mapping.fa)) {
            // Add fontawesome icon import
            tsContent = `import { ${mapping.fa} } from '@fortawesome/free-solid-svg-icons';\n` + tsContent;

            // Add class property
            tsContent = tsContent.replace(/export class [a-zA-Z0-9_]+ implements [a-zA-Z0-9_, ]+ {/, `$& \n  ${mapping.fa} = ${mapping.fa};`);
            // If it doesn't implement anything:
            tsContent = tsContent.replace(/export class [a-zA-Z0-9_]+ {/, `$& \n  ${mapping.fa} = ${mapping.fa};`);

            fs.writeFileSync(tsFile, tsContent, 'utf8');
            console.log(`Updated TS: ${tsFile}`);
        }
    }
});
