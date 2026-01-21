import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-kursblatt',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './kursblatt.component.html',
    styleUrl: './kursblatt.component.css'
})
export class KursblattComponent implements OnInit {
    pdfUrl: SafeResourceUrl | null = null;
    rawPdfUrl: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        const umUid = this.route.snapshot.paramMap.get('umUid');
        if (umUid) {
            const url = `/api/kursblatt/${umUid}/pdf`;
            this.rawPdfUrl = url;
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
    }
}
