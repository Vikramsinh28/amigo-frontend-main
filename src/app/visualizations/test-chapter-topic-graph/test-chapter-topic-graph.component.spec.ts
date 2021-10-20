import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestChapterTopicGraphComponent } from './test-chapter-topic-graph.component';

describe('TestChapterTopicGraphComponent', () => {
  let component: TestChapterTopicGraphComponent;
  let fixture: ComponentFixture<TestChapterTopicGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestChapterTopicGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestChapterTopicGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
