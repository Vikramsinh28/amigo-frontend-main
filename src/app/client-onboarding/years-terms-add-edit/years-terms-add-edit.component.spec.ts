import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YearsTermsAddEditComponent } from './years-terms-add-edit.component';

describe('YearsTermsAddEditComponent', () => {
  let component: YearsTermsAddEditComponent;
  let fixture: ComponentFixture<YearsTermsAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YearsTermsAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YearsTermsAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
