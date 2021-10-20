import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCtReportComponent } from './test-ct-report.component';

describe('TestCtReportComponent', () => {
  let component: TestCtReportComponent;
  let fixture: ComponentFixture<TestCtReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestCtReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCtReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
