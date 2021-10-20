import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentYearlyAchievementsParticipationComponent } from './student-yearly-achievements-participation.component';

describe('StudentYearlyAchievementsParticipationComponent', () => {
  let component: StudentYearlyAchievementsParticipationComponent;
  let fixture: ComponentFixture<StudentYearlyAchievementsParticipationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentYearlyAchievementsParticipationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentYearlyAchievementsParticipationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
