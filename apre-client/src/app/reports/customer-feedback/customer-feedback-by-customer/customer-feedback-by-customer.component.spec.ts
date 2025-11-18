import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerFeedbackByCustomerComponent } from './customer-feedback-by-customer.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';


describe('CustomerFeedbackByCustomerComponent', () => {
  let component: CustomerFeedbackByCustomerComponent;
  let fixture: ComponentFixture<CustomerFeedbackByCustomerComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, CustomerFeedbackByCustomerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerFeedbackByCustomerComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);



    fixture.detectChanges();

    const initReq = httpMock.expectOne(`${environment.apiBaseUrl}/reports/customer-feedback/customer-names`);
    initReq.flush([ "John", "Jane" ]);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no pending requests
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  // Test 1: Should show error if no customer is selected
  it('should show error if no customer is selected', () => {
    component.customerForm.controls['customer'].setValue('');

    component.onSubmit();

    expect(component.errorMessage).toBe('Please select a customer');
    expect(component.feedback.length).toBe(0);
  });


  // Test 2: Should populate feedback after form submission
  it('should populate feedback after form submission', () => {
    const mockData = [
      {
        customerName: 'John Doe',
        products: ['Product A', 'Product B'],
        feedbacks: ['Great product', 'Satisfactory']
      }
    ];

    // set a valid customer value
    component.customerForm.controls['customer'].setValue('John Doe');
    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-customer/John Doe`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    expect(component.feedback.length).toBe(2);
    expect(component.feedback[0]['Customer']).toBe('John Doe');
    expect(component.feedback[0]['Product']).toBe('Product A');
    expect(component.feedback[0]['Feedback']).toBe('Great product');
    expect(component.feedback[1]['Customer']).toBe('John Doe');
    expect(component.feedback[1]['Product']).toBe('Product B');
    expect(component.feedback[1]['Feedback']).toBe('Satisfactory');
  });

  // Test 3: Should populate a default message for missing feedbacks
  it('should show "Not Available" for products with missing feedbacks', () => {
    component.customerForm.controls['customer'].setValue('Jim Halpert');
    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-customer/Jim Halpert`);
    expect(req.request.method).toBe('GET');

    // Simulate API response with missing feedback for second product
    const mockData = [
      {
        customerName: 'Jim Halpert',
        products: ['Smartphone X', 'Laptop Z'],
        feedbacks: ['Great phone'] // second product has missing feedback
      }
    ];

    req.flush(mockData);

    expect(component.feedback.length).toBe(2);
    expect(component.feedback[0]).toEqual({
      Customer: 'Jim Halpert',
      Product: 'Smartphone X',
      Feedback: 'Great phone'
    });
    expect(component.feedback[1]).toEqual({
      Customer: 'Jim Halpert',
      Product: 'Laptop Z',
      Feedback: 'Not Available'
    });
    expect(component.errorMessage).toBe('');
  });
});

