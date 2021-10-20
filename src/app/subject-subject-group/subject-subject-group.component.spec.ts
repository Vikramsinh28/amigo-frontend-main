import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectSubjectGroupComponent } from './subject-subject-group.component';

describe('SubjectSubjectGroupComponent', () => {
  let component: SubjectSubjectGroupComponent;
  let fixture: ComponentFixture<SubjectSubjectGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubjectSubjectGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectSubjectGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
