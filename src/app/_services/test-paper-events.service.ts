import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestPaperEventsService {

  private testDetails = new BehaviorSubject<any>({
                                              studentExamId: -1,
                                              testPaperId: -1,
                                              testName: '',
                                              duration: -1,
                                              grade: '',
                                              marks: -1,
                                              subject: '',
                                              instructions: ''
                                            });
  sharedTestDetails = this.testDetails.asObservable();


  private testEvalDetails = new BehaviorSubject<any>({
    examId: -1,
    gradeDivisionIds: '',
    gradeDivisionNames: ''
  });
sharedTestEvalDetails = this.testEvalDetails.asObservable();


  constructor() { }

  nextTestDetails(testDetails: any) {
    this.testDetails.next(testDetails);
  }

  getValue()
  {
    this.testDetails.getValue()
  }

  nextTestEvalDetails(testEvalDetails: any)
  {
    this.testEvalDetails.next(testEvalDetails);
  }

  getTestEvalValue()
  {
    this.testEvalDetails.getValue()
  }
}
