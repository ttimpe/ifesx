import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecOmDetailComponent } from './rec-om-detail.component';
import { RecOmService } from '../../services/rec-om.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

describe('RecOmDetailComponent', () => {
    let component: RecOmDetailComponent;
    let fixture: ComponentFixture<RecOmDetailComponent>;
    let mockService: any;

    beforeEach(async () => {
        mockService = {
            getById: () => of({}),
            create: () => of({}),
            update: () => of({}),
            delete: () => of({})
        };

        await TestBed.configureTestingModule({
            imports: [RecOmDetailComponent, HttpClientTestingModule, FormsModule],
            providers: [
                { provide: RecOmService, useValue: mockService },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(RecOmDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
