import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';

import { ViewportScroller } from '@angular/common';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class HelpComponent {
    constructor(private scroller: ViewportScroller) { }

    scrollTo(id: string) {
        this.scroller.scrollToAnchor(id);
    }
}
