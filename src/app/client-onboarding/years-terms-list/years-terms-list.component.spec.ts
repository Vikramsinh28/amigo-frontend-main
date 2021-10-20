import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YearsTermsListComponent } from './years-terms-list.component';

describe('YearsTermsListComponent', () => {
  let component: YearsTermsListComponent;
  let fixture: ComponentFixture<YearsTermsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YearsTermsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YearsTermsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
