import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule} from '@angular/common/http/testing';
import { SalesByCustomerComponent } from './sales-by-customer.component';

describe('SalesByCustomerComponent', () => {
  let component: SalesByCustomerComponent;
  let fixture: ComponentFixture<SalesByCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesByCustomerComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
