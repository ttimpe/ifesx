import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { Fahrzeug } from '../../models/fahrzeug.model';
import { MengeFzgTyp } from '../../models/menge-fzg-typ.model';
import { CalendarService } from '../../services/calendar.service';
import { ConfirmationService } from 'primeng/api';

// PrimeNG
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Button, InputText, SelectModule, CardModule, InputNumberModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.css'
})
export class VehicleDetailComponent implements OnInit {
  vehicle: Fahrzeug | null = null;
  types: MengeFzgTyp[] = [];
  selectedBasisVersion: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private calendarService: CalendarService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.calendarService.selectedVersion$.subscribe(version => {
      this.selectedBasisVersion = version || undefined;
      this.loadTypes();

      const id = parseInt(this.route.snapshot.paramMap.get('id') || '0');
      if (id) {
        this.loadVehicle(id);
      }
    });
  }

  loadVehicle(id: number) {
    this.vehicleService.getVehicle(id, this.selectedBasisVersion).subscribe(data => {
      this.vehicle = data;
    });
  }

  loadTypes() {
    this.vehicleService.getAllTypes(this.selectedBasisVersion).subscribe(data => {
      this.types = data;
    });
  }

  save() {
    if (this.vehicle) {
      this.vehicleService.updateVehicle(this.vehicle.FZG_NR, this.vehicle).subscribe(() => {
        this.router.navigate(['/vehicles']);
      });
    }
  }

  delete() {
    if (!this.vehicle) return;

    this.confirmationService.confirm({
      message: `Fahrzeug ${this.vehicle.FZG_TEXT || this.vehicle.FZG_NR} wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (this.vehicle) {
          this.vehicleService.deleteVehicle(this.vehicle.FZG_NR, this.selectedBasisVersion).subscribe(() => {
            this.router.navigate(['/vehicles']);
          });
        }
      }
    });
  }
}
