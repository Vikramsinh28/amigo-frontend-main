import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfileBioComponent } from './edit-profile-bio.component';

describe('EditProfileBioComponent', () => {
  let component: EditProfileBioComponent;
  let fixture: ComponentFixture<EditProfileBioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditProfileBioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProfileBioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
