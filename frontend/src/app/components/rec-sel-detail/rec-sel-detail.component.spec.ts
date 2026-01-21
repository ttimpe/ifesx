import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecSelDetailComponent } from './rec-sel-detail.component';
import { RecSelService } from '../../services/rec-sel.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

describe('RecSelDetailComponent', () => {
    let component: RecSelDetailComponent;
    let fixture: ComponentFixture<RecSelDetailComponent>;
    let mockService: any;

    beforeEach(async () => {
        mockService = {
            getById: () => of({}),
            create: () => of({}),
            update: () => of({}),
            delete: () => of({})
        };

        await TestBed.configureTestingModule({
            imports: [RecSelDetailComponent, HttpClientTestingModule, FormsModule],
            providers: [
                { provide: RecSelService, useValue: mockService },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(RecSelDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
