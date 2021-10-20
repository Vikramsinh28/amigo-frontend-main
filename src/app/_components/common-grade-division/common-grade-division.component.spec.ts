import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonGradeDivisionComponent } from './common-grade-division.component';

describe('CommonGradeDivisionComponent', () => {
  let component: CommonGradeDivisionComponent;
  let fixture: ComponentFixture<CommonGradeDivisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonGradeDivisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonGradeDivisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
