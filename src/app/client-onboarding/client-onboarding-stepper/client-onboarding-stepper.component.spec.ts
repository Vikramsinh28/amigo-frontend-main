import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientOnboardingStepperComponent } from './client-onboarding-stepper.component';

describe('ClientOnboardingStepperComponent', () => {
  let component: ClientOnboardingStepperComponent;
  let fixture: ComponentFixture<ClientOnboardingStepperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientOnboardingStepperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientOnboardingStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
