import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationContentComponent } from './communication-content.component';

describe('CommunicationContentComponent', () => {
  let component: CommunicationContentComponent;
  let fixture: ComponentFixture<CommunicationContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunicationContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
