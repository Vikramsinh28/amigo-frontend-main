import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonFilterComponentComponent } from './common-filter-component.component';

describe('CommonFilterComponentComponent', () => {
  let component: CommonFilterComponentComponent;
  let fixture: ComponentFixture<CommonFilterComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonFilterComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonFilterComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
