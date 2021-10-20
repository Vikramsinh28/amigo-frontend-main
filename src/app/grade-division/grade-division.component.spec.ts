import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeDivisionComponent } from './grade-division.component';

describe('GradeDivisionComponent', () => {
  let component: GradeDivisionComponent;
  let fixture: ComponentFixture<GradeDivisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GradeDivisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GradeDivisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
