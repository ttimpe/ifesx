import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { Betriebstag } from 'src/app/models/betriebstag.model';
import { Tagesart } from 'src/app/models/tagesart.model';

@Component({
  selector: 'app-year-calendar',
  templateUrl: './year-calendar.component.html',
  styleUrls: ['./year-calendar.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class YearCalendarComponent {
  @Input() beginDate: Date = new Date()
  @Input() endDate: Date = new Date()
  @Input() betriebstage: Betriebstag[] = [];
  @Input() tagesarten: Tagesart[] = [];

  @Output() datesSelected = new EventEmitter<number[]>();

  calendar: any[] = [];
  selectedDates: Set<number> = new Set(); // Store selected dates as YYYYMMDD numbers
  isMultiSelectMode: boolean = true; // Default to multi-select mode
  lastClickedDate: Date | null = null;


  ngOnInit() {
    if (this.beginDate && this.endDate) {
      this.generateCalendar();
    }
  }

  // Rebuild the calendar when inputs change
  ngOnChanges(changes: SimpleChanges) {
    if (changes['beginDate'] || changes['endDate'] || changes['betriebstage']) {
      this.generateCalendar();
    }
  }

  generateCalendar() {
    this.calendar = []
    const start = new Date(this.beginDate);
    start.setDate(1); // Start at the beginning of the month
    const end = new Date(this.endDate);
    end.setDate(1); // Start at the beginning of the month

    let currentDate = new Date(start);
    while (currentDate <= end) {
      this.calendar.push(this.generateMonth(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  generateMonth(date: Date) {
    const month = [];
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

    let startOfWeek = this.getMonday(new Date(firstDayOfMonth));
    let current = new Date(startOfWeek);

    while (current <= lastDayOfMonth || current.getDay() !== 1) {
      const isCurrentMonth = current.getMonth() === monthIndex;
      const betriebstag = this.findBetriebstag(current);
      const isOutOfRange = current < this.beginDate || current > this.endDate;
      const dateNumber = this.formatDateToYYYYMMDD(current);

      month.push({
        date: new Date(current),
        dateNumber: dateNumber,
        isCurrentMonth,
        isOutOfRange,
        isSelected: this.selectedDates.has(dateNumber),
        betriebstag: betriebstag,
        tagesart: betriebstag ? this.tagesarten.find(t => t.TAGESART_NR === betriebstag.TAGESART_NR) : undefined,
        specialClass: betriebstag ? `special-${betriebstag.TAGESART_NR}` : null
      });
      current.setDate(current.getDate() + 1);
    }
    return { month: formatDate(firstDayOfMonth, 'MMMM yyyy', 'de'), days: month };
  }

  findBetriebstag(date: Date): Betriebstag | undefined {
    const formattedDate = this.formatDateToYYYYMMDD(date);
    return this.betriebstage.find(betriebstag => betriebstag.BETRIEBSTAG === formattedDate);
  }

  formatDateToYYYYMMDD(date: Date): number {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return parseInt(`${year}${month}${day}`, 10);
  }

  getMonday(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Adjust for Sunday
    date.setDate(date.getDate() + diff);
    return date;
  }

  // Multi-select functionality
  toggleMultiSelectMode() {
    this.isMultiSelectMode = !this.isMultiSelectMode;
    if (!this.isMultiSelectMode) {
      this.clearSelection();
    }
  }

  onDayClick(event: MouseEvent, day: any) {
    if (day.isOutOfRange) {
      return; // Don't select out-of-range dates
    }

    const date = day.date;
    const dateNum = day.dateNumber;

    if (event.shiftKey && this.lastClickedDate) {
      // Range selection
      const start = this.lastClickedDate < date ? this.lastClickedDate : date;
      const end = this.lastClickedDate < date ? date : this.lastClickedDate;
      const append = event.ctrlKey || event.metaKey;

      this.selectDateRange(start, end, append);
    } else if (event.ctrlKey || event.metaKey) {
      // Toggle single selection
      if (this.selectedDates.has(dateNum)) {
        this.selectedDates.delete(dateNum);
      } else {
        this.selectedDates.add(dateNum);
      }
    } else {
      // Normal click: select single (clear others)
      this.selectedDates.clear();
      this.selectedDates.add(dateNum);
    }

    this.lastClickedDate = new Date(date);
    this.syncSelectionUI();
    this.datesSelected.emit(Array.from(this.selectedDates));
  }

  syncSelectionUI() {
    this.calendar.forEach(month => {
      month.days.forEach((day: any) => {
        day.isSelected = this.selectedDates.has(day.dateNumber);
      });
    });
  }

  clearSelection() {
    this.selectedDates.clear();
    this.lastClickedDate = null;
    this.syncSelectionUI();
    this.datesSelected.emit([]);
  }

  selectDateRange(startDate: Date, endDate: Date, append: boolean = false) {
    if (!append) {
      this.selectedDates.clear();
    }

    const current = new Date(startDate);
    // Standardize to midnight to avoid off-by-one or daylight savings issues
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      // Check if current date is within the global range
      const currentNum = this.formatDateToYYYYMMDD(current);
      if (current >= this.beginDate && current <= this.endDate) {
        this.selectedDates.add(currentNum);
      }
      current.setDate(current.getDate() + 1);
    }

    this.syncSelectionUI();
  }

  getDayClasses(day: any): any {
    const classes: any = {
      'outside-month': !day.isCurrentMonth,
      'out-of-range': day.isOutOfRange,
      'selected': day.isSelected,
      'selectable': this.isMultiSelectMode && !day.isOutOfRange
    };

    if (day.specialClass) {
      classes[day.specialClass] = true;
    }

    return classes;
  }
}
