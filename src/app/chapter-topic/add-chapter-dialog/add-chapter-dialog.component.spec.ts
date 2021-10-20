import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChapterDialogComponent } from './add-chapter-dialog.component';

describe('AddChapterDialogComponent', () => {
  let component: AddChapterDialogComponent;
  let fixture: ComponentFixture<AddChapterDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddChapterDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChapterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
