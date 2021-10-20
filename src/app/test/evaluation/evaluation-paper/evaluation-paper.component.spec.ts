import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationPaperComponent } from './evaluation-paper.component';

describe('EvaluationPaperComponent', () => {
  let component: EvaluationPaperComponent;
  let fixture: ComponentFixture<EvaluationPaperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationPaperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationPaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
