import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentPerformanceByRegionComponent } from './agent-performance-by-region.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
describe('AgentPerformanceByRegionComponent', () => {
  let component: AgentPerformanceByRegionComponent;
  let fixture: ComponentFixture<AgentPerformanceByRegionComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, AgentPerformanceByRegionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentPerformanceByRegionComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  // Test 1: Should fetch regions on init
  it('should fetch regions on init', () => {
    const mockRegions = ['North America', 'Europe'];

    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/agent-performance/regions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRegions);

    expect(component.regions).toEqual(mockRegions);
  });

  // Test 2: Should populate performance metrics after form submission
  it('should populate performance metrics after form submission', () => {
    const mockData = [
      { metricType: 'Customer Satisfaction', value: 80 },
      { metricType: 'Sales Conversion', value: 60 }
    ];

    // set a valid region value
    component.regionForm.controls['region'].setValue('East');
    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/agent-performance/regions/East`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    expect(component.performanceMetrics.length).toBe(1);
    expect(component.performanceMetrics[0]['Region']).toBe('East');
    expect(component.performanceMetrics[0]['Customer Satisfaction']).toBe(80);
    expect(component.performanceMetrics[0]['Sales Conversion']).toBe(60);
  });


  // Test 2: Handle API error gracefully
  it('should handle errors when fetching performance data', () => {
    const mockRegion = 'Foo';
    component.regionForm.controls['region'].setValue(mockRegion);

    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/agent-performance/regions/${mockRegion}`);
    req.error(new ErrorEvent('Network error'));

    // Expect empty array on error
    expect(component.performanceMetrics).toEqual([]);
  });

});
