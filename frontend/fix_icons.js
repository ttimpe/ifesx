const fs = require('fs');
const path = require('path');

const iconMap = {
  'calendar-overview': { pi: 'pi-calendar', fa: 'faCalendar' },
  'stop-detail': { pi: 'pi-map-marker', fa: 'faCircleH', file: 'stop-detail.component.html', ts: 'stop-detail.component.ts', faImport: 'faCircleH' },
  'line-detail': { pi: 'pi-share-alt', fa: 'faRoute', file: 'line-detail.component.html', ts: 'line-detail.component.ts', faImport: 'faRoute' },
  'destination-detail': { pi: 'pi-map-marker', fa: 'faLocationCrosshairs', file: 'destination-detail.component.html', ts: 'destination-detail.component.ts', faImport: 'faLocationCrosshairs' },
  'vehicle-detail': { pi: 'pi-car', fa: 'faBus', file: 'vehicle-detail.component.html', ts: 'vehicle-detail.component.ts', faImport: 'faBus' },   // guessing
  'bhof-detail': { pi: 'pi-building', fa: 'faBuilding', file: 'bhof-detail.component.html', ts: 'bhof-detail.component.ts', faImport: 'faBuilding' },
};

const baseDir = path.join(__dirname, 'src', 'app', 'components');

for (const [key, mapping] of Object.entries(iconMap)) {
    if (!mapping.file) continue;
    const htmlPath = path.join(baseDir, key, mapping.file);
    const tsPath = path.join(baseDir, key, mapping.ts);
    
    if (fs.existsSync(htmlPath)) {
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        // Example: <i class="pi pi-map-marker text-xl" ...></i> -> <fa-icon [icon]="faCircleH" class="text-xl" ...></fa-icon>
        // the regex needs to capture classes and other attributes except `pi pi-xxx`
        const regex = new RegExp(`<i class="pi ${mapping.pi}(.*?)"(.*?)></i>`, 'g');
        let newHtml = htmlContent.replace(regex, `<fa-icon [icon]="${mapping.fa}" class="$1"$2></fa-icon>`);
        
        if (newHtml !== htmlContent) {
           fs.writeFileSync(htmlPath, newHtml, 'utf8');
           console.log(`Updated HTML: ${htmlPath}`);

           if (fs.existsSync(tsPath)) {
               let tsContent = fs.readFileSync(tsPath, 'utf8');
               if (!tsContent.includes(`fa${mapping.fa.substring(2)}`)) {
                   // Add import
                   tsContent = tsContent.replace(/import {([^}]+)} from '@fortawesome\/free-solid-svg-icons';/, (match, p1) => {
                       return `import {${p1}, ${mapping.faImport} } from '@fortawesome/free-solid-svg-icons';`;
                   });
                   // If FontAwesome isn't imported at all this will fail, 
                   // but most detail components already import it for other things.
                   // Let's also add the property to the class.
                   tsContent = tsContent.replace(/export class\s+\w+\s+(implements\s+\w+\s+)?{/, `$& \n  ${mapping.fa} = ${mapping.faImport};`);
                   fs.writeFileSync(tsPath, tsContent, 'utf8');
                   console.log(`Updated TS: ${tsPath}`);
               }
           }
        }
    }
}
