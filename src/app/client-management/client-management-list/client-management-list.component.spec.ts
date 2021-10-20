import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientManagementListComponent } from './client-management-list.component';

describe('ClientManagementListComponent', () => {
  let component: ClientManagementListComponent;
  let fixture: ComponentFixture<ClientManagementListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientManagementListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
