import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterTopicComponent } from './chapter-topic.component';

describe('ChapterTopicComponent', () => {
  let component: ChapterTopicComponent;
  let fixture: ComponentFixture<ChapterTopicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChapterTopicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChapterTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
