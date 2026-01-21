import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecSelListComponent } from './rec-sel-list.component';
import { RecSelService } from '../../services/rec-sel.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('RecSelListComponent', () => {
    let component: RecSelListComponent;
    let fixture: ComponentFixture<RecSelListComponent>;
    let mockService: any;

    beforeEach(async () => {
        mockService = { getAll: () => of([]) };

        await TestBed.configureTestingModule({
            imports: [RecSelListComponent, HttpClientTestingModule],
            providers: [
                { provide: RecSelService, useValue: mockService },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(RecSelListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
