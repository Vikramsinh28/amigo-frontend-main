import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientManagementAddEditComponent } from './client-management-add-edit.component';

describe('ClientManagementAddEditComponent', () => {
  let component: ClientManagementAddEditComponent;
  let fixture: ComponentFixture<ClientManagementAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientManagementAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientManagementAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
