import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticeBoardListComponent } from './notice-board-list.component';

describe('NoticeBoardListComponent', () => {
  let component: NoticeBoardListComponent;
  let fixture: ComponentFixture<NoticeBoardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoticeBoardListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoticeBoardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
