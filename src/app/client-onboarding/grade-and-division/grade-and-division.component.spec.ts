import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeAndDivisionComponent } from './grade-and-division.component';

describe('GradeAndDivisionComponent', () => {
  let component: GradeAndDivisionComponent;
  let fixture: ComponentFixture<GradeAndDivisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GradeAndDivisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GradeAndDivisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
