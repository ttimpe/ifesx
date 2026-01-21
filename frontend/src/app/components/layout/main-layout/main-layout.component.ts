import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CalendarService } from '../../../services/calendar.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
<div class="flex h-screen overflow-hidden bg-slate-50">
  <!-- Sidebar -->
  <app-sidebar></app-sidebar>

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
    <!-- Top Header (Optional) -->
    
    <!-- Router Outlet (Scrollable Content) -->
    <main class="flex-1 overflow-auto bg-slate-50" [class.p-6]="!isMap" [class.p-0]="isMap">
      <div [class.max-w-7xl]="!isMap" [class.mx-auto]="!isMap" [class.h-full]="isMap" [class.w-full]="isMap">
        <router-outlet></router-outlet>
      </div>
    </main>
  </div>
</div>
  `,
  styles: [`
    /* Tailwind handles layout */
  `]
})
export class MainLayoutComponent {
  constructor(
    private router: Router,
    private calendarService: CalendarService
  ) { }

  ngOnInit() {
    this.calendarService.getVersionen().subscribe(versions => {
      // If no versions exist and we are not in a standalone route, maybe redirect?
      // Actually, if we are in MainLayout, we should have versions.
      // But MainLayout wraps almost everything. 
      // If versions.length == 0, go to welcome.
      if (versions.length === 0) {
        this.router.navigate(['/welcome']);
      }
    });

    // Also need to load data initially if not happened? 
    // CalendarService usually does it on demand?
    // Let's assume getVersionen() triggers valid fetch.
  }

  get isMap(): boolean {
    return this.router.url.includes('/network');
  }
}
