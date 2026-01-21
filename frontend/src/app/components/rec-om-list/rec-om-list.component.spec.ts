import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecOmListComponent } from './rec-om-list.component';
import { RecOmService } from '../../services/rec-om.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('RecOmListComponent', () => {
    let component: RecOmListComponent;
    let fixture: ComponentFixture<RecOmListComponent>;
    let mockService: any;

    beforeEach(async () => {
        mockService = { getAll: () => of([]) };

        await TestBed.configureTestingModule({
            imports: [RecOmListComponent, HttpClientTestingModule],
            providers: [
                { provide: RecOmService, useValue: mockService },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(RecOmListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
