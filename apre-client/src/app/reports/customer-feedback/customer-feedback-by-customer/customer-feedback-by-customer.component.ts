import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../../../shared/table/table.component';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-feedback-by-customer',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule],
  template: `
    <h1>Customer Feedback by Customer</h1>
    <div class="customer-container">
      <form class="form" [formGroup]="customerForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="customer">Customer</label>
          <select class="select" formControlName="customer" id="customer" name="customer">
            <option value=""> -- select a customer -- </option>
            @for(customer of customers; track customer) {
              <option [value]="customer">{{ customer }}</option>
            }
          </select>
        </div>
        <div class="form__actions">
          <button class="button button--primary" type="submit">Get Data</button>
        </div>
      </form>

      @if (feedback.length > 0) {
        <div class="card chart-card">
          <app-table
            [title]="'Customer feedback by customer'"
            [data]="feedback"
            [headers]="['Customer', 'Product', 'Feedback']"
            [sortableColumns]="['Customer']"
            [headerBackground]="'secondary'"
            >
          </app-table>
        </div>
      }


    </div>
  `,
  styles: `
    .customer-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
      padding: 10px;
    }

    app-table {
      padding: 50px;
    }
  `
})
export class CustomerFeedbackByCustomerComponent {
  customers: string[] =[];
  feedback: { Customer: string; Product: string; Feedback: string }[] = [];
  errorMessage: string = '';

  // Form group for selecting customer
  customerForm = this.fb.group({
    customer: ['', Validators.required]
  });

  constructor(private http: HttpClient, private fb: FormBuilder){
    // Fetch the available regions from the API
    this.http
    .get<string[]>(`${environment.apiBaseUrl}/reports/customer-feedback/customer-names`)
    .subscribe({
      next: (data) => {
        this.customers = data;
      },
      error: (err) => {
        console.error('Error fetching customers:', err);
        this.errorMessage = 'Unable to load customer list.';
      }
    });
  }

  onSubmit(){
    this.errorMessage = '';


    // Get the selected customer from the dropdown form
    const customer = this.customerForm.controls['customer'].value;

    // Validate that a customer has been selected
    if(!customer){
      this.errorMessage = 'Please select a customer';
      return;
    }

    this.http
    .get<any[]>(`${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-customer/${customer}`)
    .subscribe({
      next: (data) => {
        // Handle case where no data is returned
        if(!data || data.length === 0){
          this.feedback = [];
          return;
        }

        // Process the returned data to extract products and feedbacks
        const entry = data[0];
        const products: string[] = entry.products ?? [];
        const feedbacks: string[] = entry.feedbacks ?? [];

        // Map products to their corresponding feedbacks
        this.feedback = products.map((product: string, index: number) => ({
          Customer: customer,
          Product: product,
          // Provide default message if feedback is missing
          Feedback: feedbacks[index] ? feedbacks[index]: "Not Available"
        }));

      },
      error: (err) => {
        console.error('Error fetching feedback: ', err);

        
        // Handle specific error cases
        if(err.status === 404){
          this.errorMessage = 'Customer does not exist.';
        }else{
          this.errorMessage = 'Could not fetch customer feedback.'
        }
      }
    })
  }
}
