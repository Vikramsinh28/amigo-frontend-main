import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestChapterTopicReportComponent } from './test-chapter-topic-report.component';

describe('TestChapterTopicReportComponent', () => {
  let component: TestChapterTopicReportComponent;
  let fixture: ComponentFixture<TestChapterTopicReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestChapterTopicReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestChapterTopicReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
