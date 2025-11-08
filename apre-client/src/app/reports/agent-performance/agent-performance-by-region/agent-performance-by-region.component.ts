import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../../../shared/table/table.component';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-agent-performance-by-region',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule],
  template: `
    <h1>Agent Performance by region</h1>
    <div class="region-container">
      <form class="form" [formGroup]="regionForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="region">Region</label>
          <select class="select" formControlName="region" id="region" name="region">
            <option value=""> -- select a region -- </option>
            @for(region of regions; track region) {
              <option [value]="region">{{ region }}</option>
            }
          </select>
        </div>
        <div class="form__actions">
          <button class="button button--primary" type="submit">Get Data</button>
        </div>
      </form>

      @if (performanceMetrics.length > 0) {
        <div class="card chart-card">
          <app-table
            [title]="'Agent Performance by Region'"
            [data]="performanceMetrics"
            [headers]="['Region', 'Customer Satisfaction', 'Sales Conversion']"
            [sortableColumns]="['Region']"
            [headerBackground]="'secondary'"
            >
          </app-table>
        </div>
      }
    </div>
  `,
  styles: `
    .region-container {
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
export class AgentPerformanceByRegionComponent {
  // Array to hold the performance metrics data
  performanceMetrics: any[] = [];
  // Array to hold the available regions
  regions: string[] = [];


  regionForm = this.fb.group({
    region: ['', Validators.required]
  });

  constructor(private http: HttpClient, private fb: FormBuilder){
    // Fetch the available regions from the API
    this.http.get<string[]>(`${environment.apiBaseUrl}/reports/agent-performance/regions`).subscribe({
      next: (data) => {
        this.regions = data;
      },
      error: (err) => {
        console.error('Error fetching regions:', err);
      }
    });
  }

  onSubmit(){
    // Get the selected region from the form
    const region = this.regionForm.controls['region'].value;

    // Fetch the agent performance data for the selected region
    this.http.get<any[]>(`${environment.apiBaseUrl}/reports/agent-performance/regions/${region}`).subscribe({
      next: (data: any[]) => {
        const row: any = {
          Region: region
        };
        // Transform the data into a single row with desired metrics
        for(let metric of data){
          if(metric.metricType === 'Customer Satisfaction'){
            row['Customer Satisfaction'] = metric.value;
          } else if (metric.metricType === 'Sales Conversion'){
            row['Sales Conversion'] = metric.value;
          }
        }

        // Update the performanceMetrics array to contain just this row
        this.performanceMetrics = [row];
        console.log('Performance Metrics: ', this.performanceMetrics)

      },
      error: (err) => {
        console.error('Error fetching agent performance data:', err);
        this.performanceMetrics = [];
      }
    })
  }

}
