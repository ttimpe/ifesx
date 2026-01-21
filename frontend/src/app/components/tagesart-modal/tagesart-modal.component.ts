import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tagesart } from 'src/app/models/tagesart.model';
@Component({
  selector: 'app-tagesart-modal',
  templateUrl: './tagesart-modal.component.html',
  styleUrls: ['./tagesart-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TagesartModalComponent {
  @Input() tagesart!: Tagesart

  saveTagesart() {
    console.log(this.tagesart)
  }
}
