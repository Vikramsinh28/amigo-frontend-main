import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationAddEditComponent } from './communication-add-edit.component';

describe('CommunicationAddEditComponent', () => {
  let component: CommunicationAddEditComponent;
  let fixture: ComponentFixture<CommunicationAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunicationAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
