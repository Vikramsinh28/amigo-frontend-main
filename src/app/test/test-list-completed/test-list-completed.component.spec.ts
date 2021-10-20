import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestListCompletedComponent } from './test-list-completed.component';

describe('TestListCompletedComponent', () => {
  let component: TestListCompletedComponent;
  let fixture: ComponentFixture<TestListCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestListCompletedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestListCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
