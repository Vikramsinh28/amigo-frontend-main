import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBankAddEditComponent } from './question-bank-add-edit.component';

describe('QuestionBankAddEditComponent', () => {
  let component: QuestionBankAddEditComponent;
  let fixture: ComponentFixture<QuestionBankAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionBankAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionBankAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
