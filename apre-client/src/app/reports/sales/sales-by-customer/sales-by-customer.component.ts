import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../../../shared/table/table.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sales-by-customer',
  standalone: true,
  imports: [TableComponent],
  template: `

    <app-table
      [title]="'Sales by Customer'"
      [data]="customers"
      [headers]="['customer', 'product', 'amount']"
      [sortableColumns]="['customer']"
    ></app-table>

  `,
  styles: ``
})
export class SalesByCustomerComponent {
  customers: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.salesByCustomer();
  }

  salesByCustomer() {
    this.http.get(`${environment.apiBaseUrl}/reports/sales/sales-by-customer`).subscribe({
      next: (data) => {
        this.customers = data as any [];
        console.log('Sales by customer data: ', data);
      },
      error: (err) => {
        console.error('Error fetching sales by customer data: ', err);
      }
    });
  }
}

