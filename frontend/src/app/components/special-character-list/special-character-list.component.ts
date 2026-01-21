import { Router, RouterModule } from '@angular/router';
import { SpecialCharacter } from './../../models/special-character.model';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpecialCharacterService } from 'src/app/services/special-character.service';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tooltip } from 'primeng/tooltip';
import { CalendarService } from '../../services/calendar.service';

@Component({
  selector: 'app-special-character-list',
  templateUrl: './special-character-list.component.html',
  styleUrls: ['./special-character-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    Button,
    InputText,
    Tooltip
  ]
})
export class SpecialCharacterListComponent implements OnInit {
  specialCharacters: SpecialCharacter[] = [];
  selectedVersion: number | null = null;
  loading: boolean = false;

  constructor(
    private specialCharacterService: SpecialCharacterService,
    private router: Router,
    private calendarService: CalendarService
  ) { }

  ngOnInit(): void {
    // Subscribe to version changes
    this.calendarService.selectedVersion$.subscribe(version => {
      this.selectedVersion = version;
      this.loadSpecialCharacters();
    });
  }

  private loadSpecialCharacters(): void {
    const version = this.selectedVersion || undefined;
    this.loading = true;
    this.specialCharacterService.getAllSpecialCharacters(version).subscribe({
      next: (specialCharacters) => {
        this.specialCharacters = specialCharacters;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching special characters:', error);
        this.loading = false;
      }
    });
  }

  deleteCharacter(char: SpecialCharacter) {
    // TODO: Implement delete logic confirmation
  }
}
