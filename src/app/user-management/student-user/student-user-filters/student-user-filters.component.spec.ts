import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentUserFiltersComponent } from './student-user-filters.component';

describe('StudentUserFiltersComponent', () => {
  let component: StudentUserFiltersComponent;
  let fixture: ComponentFixture<StudentUserFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentUserFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentUserFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
