import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { Fahrzeug } from '../../models/fahrzeug.model';
import { MengeFzgTyp } from '../../models/menge-fzg-typ.model';
import { CalendarService } from '../../services/calendar.service';
import { ConfirmationService, TreeNode } from 'primeng/api';

// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBus } from '@fortawesome/free-solid-svg-icons';

// PrimeNG Imports
import { TreeTableModule } from 'primeng/treetable';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';

@Component({
    selector: 'app-vehicle-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        FontAwesomeModule,
        TreeTableModule,
        Button,
        InputText,
        SelectModule,
        DialogModule,
        InputNumberModule,
        ConfirmDialogModule,
        DividerModule
    ],
    providers: [ConfirmationService],
    templateUrl: './vehicle-list.component.html',
    styleUrls: ['./vehicle-list.component.css']
})
export class VehicleListComponent implements OnInit {
    treeData: TreeNode[] = [];
    types: MengeFzgTyp[] = [];
    vehicles: Fahrzeug[] = [];

    faBus = faBus;

    // Single create modal state
    showCreate = false;
    newVehicle: Partial<Fahrzeug> = {};

    // Vehicle Type create/edit modal state
    showTypeDialog = false;
    currentType: Partial<MengeFzgTyp> = {};
    isEditingType = false;

    // Batch create modal state
    showBatchCreate = false;
    batchParams = {
        startNumber: 0,
        count: 0,
        fzgTypNr: 0,
        polkennPrefix: ''
    };

    selectedBasisVersion: number | undefined;

    constructor(
        private vehicleService: VehicleService,
        private calendarService: CalendarService,
        private router: Router,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.calendarService.selectedVersion$.subscribe(version => {
            this.selectedBasisVersion = version || undefined;
            this.loadData();
        });
    }

    loadData() {
        // Load both types and vehicles
        this.vehicleService.getAllTypes(this.selectedBasisVersion).subscribe(types => {
            this.types = types;

            this.vehicleService.getAllVehicles(this.selectedBasisVersion).subscribe(vehicles => {
                this.vehicles = vehicles;
                this.buildTreeData();
            });
        });
    }

    buildTreeData() {
        this.treeData = this.types.map(type => ({
            data: {
                isType: true,
                name: type.FZG_TYP_TEXT || `Typ ${type.FZG_TYP_NR}`,
                fzgTypNr: type.FZG_TYP_NR,
                polkenn: '',
                typeData: type,
                actions: null
            },
            children: this.vehicles
                .filter(v => v.FZG_TYP_NR === type.FZG_TYP_NR)
                .map(vehicle => ({
                    data: {
                        isType: false,
                        name: vehicle.POLKENN || vehicle.FZG_TEXT || `Fzg ${vehicle.FZG_NR}`,
                        fzgNr: vehicle.FZG_NR,
                        polkenn: vehicle.POLKENN,
                        vehicle: vehicle,
                        actions: vehicle
                    }
                })),
            expanded: true
        }));
    }

    openCreate() {
        this.newVehicle = {
            BASIS_VERSION: this.selectedBasisVersion || 1,
            FZG_TYP_NR: 0
        };
        this.showCreate = true;
    }

    saveNew() {
        if (this.newVehicle.FZG_TYP_NR) {
            this.vehicleService.createVehicle(this.newVehicle as Fahrzeug).subscribe(() => {
                this.loadData();
                this.showCreate = false;
            });
        }
    }

    editVehicle(vehicle: Fahrzeug) {
        this.router.navigate(['/vehicles', vehicle.FZG_NR]);
    }

    deleteVehicle(vehicle: Fahrzeug) {
        this.confirmationService.confirm({
            message: `Möchten Sie Fahrzeug ${vehicle.POLKENN || vehicle.FZG_NR} wirklich löschen?`,
            header: 'Löschen bestätigen',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Löschen',
            rejectLabel: 'Abbrechen',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.vehicleService.deleteVehicle(vehicle.FZG_NR, this.selectedBasisVersion).subscribe(() => {
                    this.loadData();
                });
            }
        });
    }

    openBatchCreate() {
        this.batchParams = {
            startNumber: 0,
            count: 10,
            fzgTypNr: 0,
            polkennPrefix: 'BI-NV-'
        };
        this.showBatchCreate = true;
    }

    executeBatchCreate() {
        if (this.batchParams.startNumber && this.batchParams.count && this.batchParams.fzgTypNr) {
            this.vehicleService.batchCreateVehicles({
                ...this.batchParams,
                basisVersion: this.selectedBasisVersion
            }).subscribe(() => {
                this.loadData();
                this.showBatchCreate = false;
            });
        }
    }

    // --- Vehicle Type Management ---

    openTypeDialog() {
        this.currentType = {
            BASIS_VERSION: this.selectedBasisVersion || 1
        };
        this.isEditingType = false;
        this.showTypeDialog = true;
    }

    editType(type: MengeFzgTyp) {
        this.currentType = { ...type };
        this.isEditingType = true;
        this.showTypeDialog = true;
    }

    saveType() {
        if (this.currentType.FZG_TYP_TEXT) {
            if (this.isEditingType && this.currentType.FZG_TYP_NR) {
                // Update existing type (we don't have update endpoint yet, but structure is here)
                this.vehicleService.createType(this.currentType as MengeFzgTyp).subscribe(() => {
                    this.loadData();
                    this.showTypeDialog = false;
                });
            } else {
                // Create new type
                this.vehicleService.createType(this.currentType as MengeFzgTyp).subscribe(() => {
                    this.loadData();
                    this.showTypeDialog = false;
                });
            }
        }
    }

    deleteType(type: MengeFzgTyp) {
        const vehicleCount = this.vehicles.filter(v => v.FZG_TYP_NR === type.FZG_TYP_NR).length;

        if (vehicleCount > 0) {
            this.confirmationService.confirm({
                message: `Fahrzeugtyp "${type.FZG_TYP_TEXT}" hat noch ${vehicleCount} zugeordnete Fahrzeuge. Trotzdem löschen?`,
                header: 'Warnung',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Löschen',
                rejectLabel: 'Abbrechen',
                acceptButtonStyleClass: 'p-button-danger',
                accept: () => {
                    // Delete type (no endpoint yet, but structure ready)
                    alert('Delete type endpoint not yet implemented in backend');
                }
            });
        } else {
            this.confirmationService.confirm({
                message: `Fahrzeugtyp "${type.FZG_TYP_TEXT}" wirklich löschen?`,
                header: 'Löschen bestätigen',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Löschen',
                rejectLabel: 'Abbrechen',
                acceptButtonStyleClass: 'p-button-danger',
                accept: () => {
                    alert('Delete type endpoint not yet implemented in backend');
                }
            });
        }
    }
}
