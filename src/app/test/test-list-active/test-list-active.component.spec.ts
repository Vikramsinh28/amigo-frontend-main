import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestListActiveComponent } from './test-list-active.component';

describe('TestListActiveComponent', () => {
  let component: TestListActiveComponent;
  let fixture: ComponentFixture<TestListActiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestListActiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestListActiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
