import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Communication } from '../entities/communication';
import { head } from '@bokeh/bokehjs/build/js/types/core/util/arrayable';



@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private static REST_URL: string = environment.apiUrl;
  private static BKEND_URL: string = environment.backendUrl;
  private static LOGIN_URL: string = BackendService.BKEND_URL.concat('login');
  private static LOGOUT_URL: string = BackendService.REST_URL.concat('logout');
  private static MENU_URL = BackendService.REST_URL.concat('menu');
  private static STUDENT_PERFORMANCE_SUBJECTWISE_URL = BackendService.REST_URL.concat('studentPerformanceSubjectwise');
  private static GET_STUDENTS_URL = BackendService.REST_URL.concat('students');
  private static STUDENT_SUBJECTS_URL = BackendService.REST_URL.concat('studentSubjects');
  private static GET_CLASS_PERFORMANCE_URL = BackendService.REST_URL.concat('classPerformance');
  private static GET_GRADE_SUBJECTS_URL = BackendService.REST_URL.concat('gradeSubjects');
  private static GRADE_STUDENTS_IN_PERCENTAGE_RANGE_URL = BackendService.REST_URL.concat('classStudentsInPercentageRange');
  private static GRADE_DIVISION_URL = BackendService.REST_URL.concat('gradedivision');
  private static GRADE_EXAM_TYPE_EXAM_LABEL_URL = BackendService.REST_URL.concat('gradeexamtypeexamlabel');
  private static ACCOMPLISHMENT_URL = BackendService.REST_URL.concat('accomplishment');
  private static GRADE_PERFORMACE_TREND = BackendService.REST_URL.concat('gradePerformaceTrend');
  private static SUBJECTS_ALL = BackendService.REST_URL.concat('subjects');
  private static SUBJECTS_ACADEMIC_GRADE_SUBJECTS = BackendService.REST_URL.concat('subjects');
  private static GRADES_ALL = BackendService.REST_URL.concat('gradeall');
  private static GRADES = BackendService.REST_URL.concat('grade');
  private static GRADES_API = BackendService.BKEND_URL.concat('grade');
  private static TERMS_API = BackendService.BKEND_URL.concat('term');
  private static ACCOMPLISHMENTS_URL = BackendService.REST_URL.concat('accomplishments');
  private static REFRESH_TOKEN = BackendService.BKEND_URL.concat('refresh');
  private static TEN_POINT_SUMMARY = BackendService.REST_URL.concat('tenpointssummary');
  private static STUDENT_PROFILE = BackendService.REST_URL.concat('studentProfile');
  private static STUDENT_SKILL_INTEREST = BackendService.REST_URL.concat('skillInterest');
  private static GRAPH_STUDENT_ACADEMIC = BackendService.REST_URL.concat('studentEntireAcademicResult');
  private static STUDENT_DEGREE_CERTIFICATION = BackendService.REST_URL.concat('studentDegreeAndCertification');
  private static EXAM_TERMS = BackendService.REST_URL.concat('examTerms');
  private static EXAM_TYPES = BackendService.REST_URL.concat('examTypes');
  private static QUESTION_TYPES = BackendService.REST_URL.concat('questionTypes');
  private static ALL_CHAPTER_TOPIC = BackendService.REST_URL.concat('allChapterTopic');
  private static DIFFICULTY_LEVELS = BackendService.REST_URL.concat('difficultyLevels');
  private static QUESTION_URL = BackendService.REST_URL.concat('question');
  private static EXAM_URL = BackendService.REST_URL.concat('exam');
  private static TP_CHAPTER_TOPIC = BackendService.REST_URL.concat('tpchaptertopic');
  private static TP_SAVE_DRAFT = BackendService.REST_URL.concat('tpsavedraft');
  private static TEST_PAPER_URL = BackendService.REST_URL.concat('testPaper');
  private static TEST_PAPER_QUESSTIONS_URL = BackendService.REST_URL.concat('tpQuestions');
  private static TEST_TEST_PAPER_URL = BackendService.REST_URL.concat('testTestPaper');
  private static STUDENT_EXAMS_URL = BackendService.REST_URL.concat('studentExam');
  private static STUDENT_TEST_PAPER_URL = BackendService.REST_URL.concat('studentTestPaper');
  private static USER_PROFILE_PICTURE = BackendService.REST_URL.concat('userProfilePicture');
  private static STUDENT_EXAMS_STATUS_URL = BackendService.REST_URL.concat('studentExamStatus');
  private static EXAMS_STUDENTS_URL = BackendService.REST_URL.concat('evalStudents');
  private static STUDENT_ANSWER_PAPER_URL = BackendService.REST_URL.concat('evalPaper');
  private static TEACHER_EVALUATION = BackendService.REST_URL.concat('teacherEval');
  private static PENDING_EVALUATION = BackendService.REST_URL.concat('pendingEval');
  private static UPDATE_EXAM_STATUS = BackendService.REST_URL.concat('examStatusUpdate');
  private static TEST_CHAPTER_TOPIC_REPORT = BackendService.REST_URL.concat('testChapterTopicReport');
  private static TEST_CHAPTER_TOPIC_GRAPH = BackendService.REST_URL.concat('testChapterTopicGraph');
  private static EXAM_RESULT_VIEW = BackendService.REST_URL.concat('ExamResultView');


  private static STUDENTS_URL = BackendService.BKEND_URL.concat('student');
  private static SUBJECT_URL = BackendService.BKEND_URL.concat('subject');
  private static STUDENT_STATE_URL = BackendService.BKEND_URL.concat('student/changeActiveState');
  private static STUDENT_RESET_PASSWORD = BackendService.BKEND_URL.concat('resetStudentPassword');

  private static EMPLOYEE_URL = BackendService.BKEND_URL.concat('employee');
  private static EMPLOYEE_STATE_URL = BackendService.BKEND_URL.concat('employee/changeActiveState');
  private static EMPLOYEE_RESET_PASSWORD = BackendService.BKEND_URL.concat('resetEmployeePassword');

  private static CLIENT = BackendService.BKEND_URL.concat('client');
  private static CHAPTER_TOPIC = BackendService.BKEND_URL.concat('chapterTopic');

  private static COMMUNICATION = BackendService.BKEND_URL.concat('communication');
  private static ASSIGNMENT = BackendService.BKEND_URL.concat('Assignment');
  // Same url TEST_PAPER_URL but this one is pointing to local server.
  private static TEST_PAPER = BackendService.BKEND_URL.concat('testPaper');
  private static QUESTION_PAPER = BackendService.BKEND_URL.concat('question');
  private static CHANGE_PASSWORD = BackendService.BKEND_URL.concat('changePassword');
  private static START_NEW_YEAR = BackendService.BKEND_URL.concat('startNewYear');
  private static CLOSE_SESSION = BackendService.START_NEW_YEAR.concat('/closeSession');

  private static EXAM_URL_2 = BackendService.BKEND_URL.concat('exam');
  private static ACCOMPLISHMENTS_URL_2 = BackendService.BKEND_URL.concat('accomplishment');




  constructor(private http: HttpClient) { }

  login(clientInternalName, username, password) {
    return this.http.post<any>(BackendService.LOGIN_URL, { clientInternalName, username, password });
  }

  logout() {
    return this.http.get(BackendService.LOGOUT_URL);
  }

  public changePassword(existingPwd, newPwd){
    return this.http.put(BackendService.CHANGE_PASSWORD, { 'existingPwd': existingPwd,  'newPwd': newPwd}, { responseType: 'text'});
  }

  public getGradeDivision(clientId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    return this.http.get(BackendService.GRADE_DIVISION_URL, { params: httpParams });
  }

  public getGradeDivisionForCurrentYear(clientId, year) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    httpParams = httpParams.set('year', year)
    return this.http.get(BackendService.GRADE_DIVISION_URL, { params: httpParams });
  }

  public getMenu(userId, roleId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('userId', userId)
    httpParams = httpParams.set('roleId', roleId)
    return this.http.get(BackendService.MENU_URL, { params: httpParams });
  }

  public getStudentPerformanceSubjectWise(id, subjects, type, period, exam) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('id', id)
    httpParams = httpParams.set('subjects', subjects)
    httpParams = httpParams.set('type', type)
    httpParams = httpParams.set('period', period)
    httpParams = httpParams.set('exam', exam)
    return this.http.get(BackendService.STUDENT_PERFORMANCE_SUBJECTWISE_URL, { params: httpParams });
  }

  public getStudents(mode, clientId, regNo, academicYear, grade, division, firstName, lastName) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('mode', mode)
    httpParams = httpParams.set('clientId', clientId)
    httpParams = httpParams.set('regNo', regNo)
    httpParams = httpParams.set('academicYear', academicYear)
    httpParams = httpParams.set('grade', grade)
    httpParams = httpParams.set('division', division)
    httpParams = httpParams.set('firstName', firstName)
    httpParams = httpParams.set('lastName', lastName)
    return this.http.get(BackendService.GET_STUDENTS_URL, { params: httpParams });
  }

  public getStudentSubjects(id, type) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('id', id)
    httpParams = httpParams.set('type', type)
    return this.http.get(BackendService.STUDENT_SUBJECTS_URL, { params: httpParams });
  }

  public getGradePerformance(clientId, academicYear, grade, division, period, exam, subjects) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    httpParams = httpParams.set('year', academicYear)
    httpParams = httpParams.set('grade', grade)
    httpParams = httpParams.set('division', division)
    httpParams = httpParams.set('period', period)
    httpParams = httpParams.set('exam', exam)
    httpParams = httpParams.set('subjects', subjects)
    return this.http.get(BackendService.GET_CLASS_PERFORMANCE_URL, { params: httpParams });
  }

  public getGradeSubjects(clientId, academicYearId = '', grade, academicYear = '') {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    if (academicYearId != '')
      httpParams = httpParams.set('yearId', academicYearId)
    httpParams = httpParams.set('grade', grade)
    if (academicYear != '')
      httpParams = httpParams.set('year', academicYear)
    return this.http.get(BackendService.GET_GRADE_SUBJECTS_URL, { params: httpParams });
  }

  public getGradeExamTypeAndExamLabel(clientId, academicYear, grade) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    httpParams = httpParams.set('year', academicYear)
    httpParams = httpParams.set('grade', grade)
    return this.http.get(BackendService.GRADE_EXAM_TYPE_EXAM_LABEL_URL, { params: httpParams });
  }

  public getGradeStudentsInPercentageRange(clientId, academicYear, grade, division, period, exam, subjectId, percentage_range) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    httpParams = httpParams.set('year', academicYear)
    httpParams = httpParams.set('grade', grade)
    httpParams = httpParams.set('division', division)
    httpParams = httpParams.set('period', period)
    httpParams = httpParams.set('exam', exam)
    httpParams = httpParams.set('subjectId', subjectId)
    httpParams = httpParams.set('percentage_range', percentage_range)
    return this.http.get(BackendService.GRADE_STUDENTS_IN_PERCENTAGE_RANGE_URL, { params: httpParams });
  }

  public updateAccomplishment(formData: FormData) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    return this.http.post(BackendService.ACCOMPLISHMENT_URL, formData, { headers: headers })
  }

  public getAccomplishment(accomplishmentId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('accomplishmentId', accomplishmentId)
    return this.http.get(BackendService.ACCOMPLISHMENT_URL, { params: httpParams });
  }

  public getGradePerformaceTrend(clientId, grade, subjects) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    httpParams = httpParams.set('grade', grade)
    httpParams = httpParams.set('subjects', subjects)
    return this.http.get(BackendService.GRADE_PERFORMACE_TREND, { params: httpParams });
  }

  public getAllSubjectsByClientId(clientId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    return this.http.get(BackendService.SUBJECTS_ALL, { params: httpParams });
  }

  public getAllAcademicSubjectsForGrade(clientId, gradeId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    httpParams = httpParams.set('gradeId', gradeId)
    return this.http.get(BackendService.SUBJECTS_ACADEMIC_GRADE_SUBJECTS, { params: httpParams });
  }

  public getAllGradesByClientId(clientId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    return this.http.get(BackendService.GRADES_ALL, { params: httpParams });
  }

  public getGradesByClientIdAndYear(clientId, year) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    httpParams = httpParams.set('year', year)
    return this.http.get(BackendService.GRADES, { params: httpParams });
  }

  public getAccomplishments(studentId, clientId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('studentId', studentId)
    httpParams = httpParams.set('clientId', clientId)
    return this.http.get(BackendService.ACCOMPLISHMENTS_URL, { params: httpParams });
  }

  public removeAccomplishment(accomplishmentId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('accomplishmentId', accomplishmentId)
    return this.http.delete(BackendService.ACCOMPLISHMENT_URL, { params: httpParams });
  }

  public RefreshToken() {
    return this.http.get(BackendService.REFRESH_TOKEN);
  }

  public getTenPointSummary(studentId, clientId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('studentId', studentId)
    httpParams = httpParams.set('clientId', clientId)
    return this.http.get(BackendService.TEN_POINT_SUMMARY, { params: httpParams });
  }

  public getStudentProfile(studentId, clientId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('student_id', studentId)
    httpParams = httpParams.set('client_id', clientId)
    return this.http.get(BackendService.STUDENT_PROFILE, { params: httpParams });
  }

  public updateStudentProfileBio(formData: FormData) {
    return this.http.post(BackendService.STUDENT_PROFILE, formData)
  }

  public updateProfilePicture(formData: FormData) {
    return this.http.post(BackendService.STUDENT_PROFILE, formData)
  }

  public createStudentSkillOrInterest(studentId, name, record_type, create_user_id) {
    return this.http.post<any>(BackendService.STUDENT_SKILL_INTEREST, {
      student_id: studentId,
      name: name,
      record_type: record_type,
      create_user_id: create_user_id
    });
  }

  public removeStudentSkillOrInterest(record_id) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('record_id', record_id)
    return this.http.delete(BackendService.STUDENT_SKILL_INTEREST, { params: httpParams });
  }

  public getStudentAcademicGraph(studentId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('studentId', studentId)
    return this.http.get(BackendService.GRAPH_STUDENT_ACADEMIC, { params: httpParams });
  }
  public getStudentDegreeAndCertification(studentId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('studentId', studentId)
    return this.http.get(BackendService.STUDENT_DEGREE_CERTIFICATION, { params: httpParams });
  }

  public getExamTerms(clientId, year?) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    if (year) {
      httpParams = httpParams.set('year', year)
    }
    return this.http.get(BackendService.EXAM_TERMS, { params: httpParams });
  }

  public getExamTypes(clientId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', clientId)
    return this.http.get(BackendService.EXAM_TYPES, { params: httpParams });
  }

  public getQuestionTypes() {
    return this.http.get(BackendService.QUESTION_TYPES);
  }

  public getAllChapterTopic(client_id, subject_id, grade) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('client_id', client_id)
    httpParams = httpParams.set('subject_id', subject_id)
    httpParams = httpParams.set('grade', grade)
    return this.http.get(BackendService.ALL_CHAPTER_TOPIC, { params: httpParams });
  }

  public getDifficultyLevels() {
    return this.http.get(BackendService.DIFFICULTY_LEVELS);
  }

  public addOrUpdateQuestion(formData: FormData) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    return this.http.post(BackendService.QUESTION_URL, formData, { headers: headers })
  }

  public getQuestion(grade = null, subject_id = null, chapter_id = null, topic_id = null, qtype = null) {
    let httpParams = new HttpParams()

    httpParams = httpParams.set('grade', grade)
    httpParams = httpParams.set('subject_id', subject_id)
    if (topic_id) {
      httpParams = httpParams.set('topic_id', topic_id)
    }
    if (chapter_id) {
      httpParams = httpParams.set('chapter_id', chapter_id)
    }
    if (qtype) {
      httpParams = httpParams.set('qtype', qtype)
    }
    return this.http.get(BackendService.QUESTION_URL, { params: httpParams });
  }

  public addOrUpdateTest(formData: FormData) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    return this.http.post(BackendService.EXAM_URL, formData, { headers: headers })
  }

  public removeExam(term_exam_id) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('term_exam_id', term_exam_id)
    return this.http.delete(BackendService.EXAM_URL, { params: httpParams });
  }

  public getExam(client_id, exam_category) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', client_id)
    httpParams = httpParams.set('examCategory', exam_category)
    return this.http.get(BackendService.EXAM_URL, { params: httpParams });
  }

  public getTestPaperChaperTopics(client_id, subject_id, grade) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', client_id)
    httpParams = httpParams.set('subjectId', subject_id)
    httpParams = httpParams.set('grade', grade)
    return this.http.get(BackendService.TP_CHAPTER_TOPIC, { params: httpParams });
  }

  public TestPaperSaveDraft(data: string) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    return this.http.post(BackendService.TP_SAVE_DRAFT, data, { headers: headers })
  }

  public getPapers(client_id, subject_id, grade) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', client_id)
    httpParams = httpParams.set('subjectId', subject_id)
    httpParams = httpParams.set('grade', grade)
    return this.http.get(BackendService.TEST_PAPER_URL, { params: httpParams });
  }

  public getTestPaperQuestions(test_paper_id, freeze) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('testPaperId', test_paper_id)
    httpParams = httpParams.set('freeze', freeze)
    return this.http.get(BackendService.TEST_PAPER_QUESSTIONS_URL, { params: httpParams });
  }

  public getTestPaperFrozen(client_id, subject_id, grade) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', client_id)
    httpParams = httpParams.set('subjectId', subject_id)
    httpParams = httpParams.set('grade', grade)
    return this.http.get(BackendService.TEST_TEST_PAPER_URL, { params: httpParams });
  }

  public getStudentExams(student_grade_id, exam_status_ids) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('studentGradeId', student_grade_id);
    httpParams = httpParams.set('examStatusIds', exam_status_ids);
    return this.http.get(BackendService.STUDENT_EXAMS_URL, { params: httpParams });
  }

  public getStudentTestPaper(test_paper_id, user_id, isForTest = false, studentExamId = -1) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('testPaperId', test_paper_id);
    httpParams = httpParams.set('userId', user_id);
    httpParams = httpParams.set('isForTest', String(isForTest));
    httpParams = httpParams.set('studentExamId', String(studentExamId));
    return this.http.get(BackendService.STUDENT_TEST_PAPER_URL, { params: httpParams });
  }

  public saveStudentTestPaper(data) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    return this.http.post(BackendService.STUDENT_TEST_PAPER_URL, data, { headers: headers })
  }

  public getStudentExamStatus(studentExamId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('studentExamId', studentExamId);
    return this.http.get(BackendService.STUDENT_EXAMS_STATUS_URL, { params: httpParams });
  }

  public getExamStudents(examId, gradeDivisionIds, checkSysEval = true) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('examId', examId);
    httpParams = httpParams.set('gradeDivisionIds', gradeDivisionIds);
    httpParams = httpParams.set('checkSysEval', String(checkSysEval));
    return this.http.get(BackendService.EXAMS_STUDENTS_URL, { params: httpParams });
  }

  public getStudentAnswerPaper(studentExamId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('studentExamId', studentExamId);
    return this.http.get(BackendService.STUDENT_ANSWER_PAPER_URL, { params: httpParams });
  }

  public getPendingEvaluation(examId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('examId', examId);
    return this.http.get(BackendService.PENDING_EVALUATION, { params: httpParams });
  }

  public updateExamStatus(data) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    return this.http.put(BackendService.UPDATE_EXAM_STATUS, data, { headers: headers })
  }

  public getStudentsDetails(data) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientId', data.clientId);
    httpParams = httpParams.set('regNo', data.regNo);
    httpParams = httpParams.set('firstName', data.fName);
    httpParams = httpParams.set('lastName', data.lName);
    httpParams = httpParams.set('activeState', data.activeStatus);
    httpParams = httpParams.set('academicYear', data.academicYear);
    httpParams = httpParams.set('grade', data.grade);
    httpParams = httpParams.set('gradeDivision', data.division);
    httpParams = httpParams.set('phone', data.phone);
    httpParams = httpParams.set('email', data.email);
    return this.http.get(BackendService.STUDENTS_URL, { params: httpParams });
  }

  public SaveTeacherEvaluation(data: string) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    return this.http.post(BackendService.TEACHER_EVALUATION, data, { headers: headers })
  }

  public TestChapterTopicReport(examId, studentExamId = '') {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('examId', examId);
    if (studentExamId != '')
      httpParams = httpParams.set('studentExamId', studentExamId);
    return this.http.get(BackendService.TEST_CHAPTER_TOPIC_REPORT, { params: httpParams });
  }

  public TestChapterTopicGraph(examId, studentExamId = '') {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('examId', examId);
    if (studentExamId != '')
      httpParams = httpParams.set('studentExamId', studentExamId);
    return this.http.get(BackendService.TEST_CHAPTER_TOPIC_GRAPH, { params: httpParams });
  }

  public putStudentState(clientId: number, studentId: any, flagValue: number) {
    let url = `${BackendService.STUDENTS_URL.concat("/changeActiveState")}/${clientId}/${studentId}`;
    return this.http.put(url, { "flagValue": flagValue }, {
      headers: new HttpHeaders({
        'Content-type': 'application/json'
      }), responseType: 'text'
    });
  }

  public putStudentResetPassword(clientId: number, selectedIds: number[]) {
    return this.http.put(BackendService.STUDENTS_URL.concat("/" + "resetStudentPassword" + "/" + clientId), { "selectedId": selectedIds }, {
      headers: new HttpHeaders({
        'Content-type': 'application/json'
      }), responseType: 'text'
    });
  }

  public getEmployeeDetails(data) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('empNo', data.empNo);
    httpParams = httpParams.set('firstName', data.fName);
    httpParams = httpParams.set('lastName', data.lName);
    httpParams = httpParams.set('phone', data.phone);
    httpParams = httpParams.set('email', data.email);
    httpParams = httpParams.set('clientRoleId', data.clientRoleId);
    httpParams = httpParams.set('activeState', data.activeStatus);
    return this.http.get(BackendService.EMPLOYEE_URL, { params: httpParams });
  }

  // Insert employee details while on-boarding
  public postEmployeeeDetailsObboardingProcess(data) {
    return this.http.post(BackendService.EMPLOYEE_URL.concat("/" + "create"), data, { responseType: 'text' });
  }

  // Insert employee details while on-boarding
  public putEmployeeeDetailsObboardingProcess(data) {
    return this.http.put(BackendService.EMPLOYEE_URL.concat("/" + "update"), data, { responseType: 'text' });
  }

  public putEmployeeState(clientId: number, studentId: any, flagValue: number) {
    let url = `${BackendService.EMPLOYEE_URL.concat("/changeActiveState")}/${clientId}/${studentId}`;
    return this.http.put(url, { "flagValue": flagValue }, {
      headers: new HttpHeaders({
        'Content-type': 'application/json'
      }), responseType: 'text'
    });
  }

  public putEmployeeResetPassword(clientId: number, selectedIds: number[]) {
    return this.http.put(BackendService.EMPLOYEE_URL.concat("/" + "resetEmployeePassword" + "/" + clientId), { "selectedId": selectedIds }, {
      headers: new HttpHeaders({
        'Content-type': 'application/json'
      }), responseType: 'text'
    });
  }

  public getClientRoles(clientId: number) {
    return this.http.get(BackendService.CLIENT.concat("/" + clientId + "/" + "role"));
  }

  public getClientGrades(clientId: number, clientYearId: number) {
    return this.http.get(BackendService.CLIENT.concat("/" + clientId + "/" + "year" + "/" + clientYearId + "/" + "grade"));
  }

  public postClientGrade(clientId, currentUserId, gradeData) {
    return this.http.post(BackendService.CLIENT.concat("/" + clientId + "/" + "grade" + "/" + "user" + "/" + currentUserId), gradeData, { responseType: 'text' });
  }

  public putClientGrade(clientId: number, currentUserId: number, gradeData) {
    return this.http.put(BackendService.CLIENT.concat("/" + clientId + "/" + "user" + "/" + currentUserId + "/" + "grade"), gradeData, { responseType: 'text' })
  }

  public deleteClientGrade(clientId: number, clientYearId: number, gradeId: number) {
    return this.http.delete(BackendService.CLIENT.concat("/" + clientId + "/" + "year" + "/" + clientYearId + "/" + "grade" + "/" + gradeId + "/" + "delete"), { responseType: 'text' })
  }


  public getClientSubjectsOrGradeDivison(clientId: number, clientYearId, grade, type) {
    return this.http.get(BackendService.CLIENT.concat("/" + clientId + "/" + "year" + "/" + clientYearId + "/" + "grade" + "/" + grade + "/" + type));
  }

  public postClientGradeDivison(currentUserId, gradeData, type, subjectOrDivisionId) {
    return this.http.post(BackendService.CLIENT.concat("/" + "grade" + "/" + type + "/" + subjectOrDivisionId + "/" + "user" + "/" + currentUserId), gradeData, { responseType: 'text' });
  }

  public putClientGradeDivison(subjectOrDivision, currentUserId, otherData, type) {
    return this.http.put(BackendService.CLIENT.concat("/" + "grade" + "/" + type + "/" + subjectOrDivision + "/" + "user" + "/" + currentUserId), otherData, { responseType: 'text' })
  }

  public deleteClientGradeDivison(gradeId: number, subjectOrDivisionId: number, type) {
    return this.http.delete(BackendService.CLIENT.concat("/" + "grade" + "/" + gradeId + "/" + type + "/" + subjectOrDivisionId + "/" + "delete"), { responseType: 'text' })
  }

  public getClientChapterTopics(grade: string, subjectId: string) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('grade', grade);
    httpParams = httpParams.set('subjectId', subjectId);
    return this.http.get(BackendService.CHAPTER_TOPIC, { params: httpParams, responseType:'json'});
  }

  public postChapterOrTopic(topicName: string, subjectId: number, grade: string, parentChapterTopicId: number, clientId: number, chapterOrTopic: number) {
    return this.http.post(BackendService.CHAPTER_TOPIC, {
      topicName: topicName,
      subjectId: subjectId,
      grade: grade,
      parentChapterTopicId: parentChapterTopicId,
      clientId: clientId,
      chapterOrTopic: chapterOrTopic
    }, {
      headers: new HttpHeaders({
        'Content-type': 'application/json'
      }), responseType: 'text'
    });
  }

  public putChapterTopic(topicName: string, chapterTopicId: number, subjectId: number, grade: string, parentChapterTopicId: number, clientId: number, chapterOrTopic: number) {
    return this.http.put(BackendService.CHAPTER_TOPIC, {
      topicName: topicName,
      chapterId: chapterTopicId,
      subjectId: subjectId,
      grade: grade,
      parentChapterTopicId: parentChapterTopicId,
      clientId: clientId,
      chapterOrTopic: chapterOrTopic
    }, {
      headers: new HttpHeaders({
        'Content-type': 'application/json'
      }), responseType: 'text'
    });
  }

  public deleteChapterTopic(deleteUserId, clientId: number, grade: string, subjectId: number, chapterTopicId: number, parentChapterTopicId: number, chapterOrTopic: number) {
    const httpOptions: any = {
      headers: {
        'Content-Type': 'application/json'
      }, responseType: "text"
    };
    httpOptions.body = {
      deleteUserId: deleteUserId,
      chapterId: chapterTopicId,
      subjectId: subjectId,
      grade: grade,
      parentChapterTopicId: parentChapterTopicId,
      clientId: clientId,
      chapterOrTopic: chapterOrTopic
    };
    return this.http.delete(BackendService.CHAPTER_TOPIC, httpOptions);
  }

  public getStudentAssignment(mode, clientId, type, subjectId, studentGradeDivisonId, clientYearId) {
    return this.http.get<Communication>(BackendService.COMMUNICATION + "/" + "client" + "/" + clientId + "/" + "year" + "/" + clientYearId + "/" + "role" + "/" + mode + "/" + "subject" + "/" + subjectId + "/" + "grade-division" + "/" + studentGradeDivisonId + "/" + type, {
      headers: new HttpHeaders({
        'Content-type': 'application/json'
      }), responseType: 'json'
    });
  }

  public geAssignment(data) {

    let httpParams = new HttpParams()
    if (data.year)
      httpParams = httpParams.set('clientYearId', data.year);

    if (data.division && data.division.length > 0)
      httpParams = httpParams.set('gradeDivisionIdCsv', data.division);

    if (data.subject)
      httpParams = httpParams.set('subjectId', data.subject);

    if (data.fromDate)
      httpParams = httpParams.set('fromDate', data.fromDate);

    if (data.toDate)
      httpParams = httpParams.set('toDate', data.toDate);

    if (data.isShared != undefined || data.isShared != '')
      httpParams = httpParams.set('isShared', data.isShared);

    if (data.isOnLoad)
      httpParams = httpParams.set('isOnLoad', data.isOnLoad);

    return this.http.get(BackendService.COMMUNICATION + "/assignment", { params: httpParams, headers: new HttpHeaders({
          'Content-type': 'application/json'
        }), responseType: 'json' });
  }

  public geRemark(data) {
    let httpParams = new HttpParams()
    if (data.year)
      httpParams = httpParams.set('clientYearId', data.year);

    if (data.grade)
      httpParams = httpParams.set('gradeId', data.grade);

    if (data.division)
      httpParams = httpParams.set('gradeDivisionId', data.division);

    if (data.student)
      httpParams = httpParams.set('studentGradeIdCsv', data.student);

    if (data.fromDate)
      httpParams = httpParams.set('fromDate', data.fromDate);

    if (data.toDate)
      httpParams = httpParams.set('toDate', data.toDate);

    if (data.isShared != undefined || data.isShared != '')
      httpParams = httpParams.set('isShared', data.isShared);

    if (data.remarkType != undefined || data.remarkType != '')
      httpParams = httpParams.set('remarkType', data.remarkType);

    if (data.isOnLoad)
      httpParams = httpParams.set('isOnLoad', data.isOnLoad);

    return this.http.get(BackendService.COMMUNICATION + "/remark", { params: httpParams, headers: new HttpHeaders({
          'Content-type': 'application/json'
        }), responseType: 'json' });
  }

  public getUEvents(data) {

    let httpParams = new HttpParams()

    httpParams = httpParams.set('useEventDate', '1');

    if (data.year)
      httpParams = httpParams.set('clientYearId', data.year);

    if (data.grade && data.grade.length > 0)
      httpParams = httpParams.set('gradeIdCsv', data.grade);

    if (data.division && data.division.length > 0)
      httpParams = httpParams.set('gradeDivisionIdCsv', data.division);

    if (data.fromDate)
      httpParams = httpParams.set('fromDate', data.fromDate);

    if (data.toDate)
      httpParams = httpParams.set('toDate', data.toDate);

    if (data.isShared != undefined || data.isShared != '')
      httpParams = httpParams.set('isShared', data.isShared);

    if (data.isOnLoad)
      httpParams = httpParams.set('isOnLoad', data.isOnLoad);

    return this.http.get(BackendService.COMMUNICATION + "/upcomingEvent", { params: httpParams, headers: new HttpHeaders({
          'Content-type': 'application/json'
        }), responseType: 'json' });
  }

  public getNotices(data) {

    let httpParams = new HttpParams()
    if (data.year)
      httpParams = httpParams.set('clientYearId', data.year);

    if (data.division && data.division.length > 0)
      httpParams = httpParams.set('gradeDivisionIdCsv', data.division);

    if (data.grade && data.grade.length > 0)
      httpParams = httpParams.set('gradeIdCsv', data.grade);

    if (data.fromDate)
      httpParams = httpParams.set('fromDate', data.fromDate);

    if (data.toDate)
      httpParams = httpParams.set('toDate', data.toDate);

    if (data.isShared != undefined || data.isShared != '')
      httpParams = httpParams.set('isShared', data.isShared);

    if (data.isOnLoad)
      httpParams = httpParams.set('isOnLoad', data.isOnLoad);


    return this.http.get(BackendService.COMMUNICATION + "/noticeBoard", { params: httpParams, headers: new HttpHeaders({
          'Content-type': 'application/json'
        }), responseType: 'json' });
  }

  public postCommunication(formData: FormData) {
    return this.http.post(BackendService.COMMUNICATION, formData, { responseType: 'text' });
  }

  public putCommunication(formData: FormData) {
    return this.http.put(BackendService.COMMUNICATION, formData, { responseType: 'text' });
  }

  public shareWithStudents(data)
  {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    return this.http.put(BackendService.COMMUNICATION + "/shareWithStudent", data, { headers: headers, responseType: 'text'});
  }

  public downloadCommunicationAttachment(communicationId)
  {
    const headers = new HttpHeaders();
    let httpParams = new HttpParams()

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    httpParams = httpParams.set('communicationId', communicationId);
    return this.http.get(BackendService.COMMUNICATION + "/download",  { params: httpParams, headers: headers, responseType: 'blob'});
  }

  public getEmployeeAccessData(data) {
    let httpParams = new HttpParams()

    httpParams = httpParams.set('clientYearId', data.clientYearId);

    if (data.roleId)
      httpParams = httpParams.set('roleId', data.roleId);

    if (data.subjectId)
      httpParams = httpParams.set('subjectId', data.subjectId);

    if (data.gradeId)
      httpParams = httpParams.set('gradeId', data.gradeId);

    if (data.gradeDivisionId)
      httpParams = httpParams.set('gradeDivisionId', data.gradeDivisionId);

    if (data.empName)
      httpParams = httpParams.set('empName', data.empName);

    return this.http.get(BackendService.EMPLOYEE_URL + "/access", { params: httpParams, headers: new HttpHeaders({
          'Content-type': 'application/json'
        }), responseType: 'json' });
  }

  public postEmployeeAccessData(data) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    return this.http.post(BackendService.EMPLOYEE_URL + "/access", data, { headers: headers })
  }

  public deleteEmployeeAccessData(data) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    let httpParams = new HttpParams()

    httpParams = httpParams.set('empAccessIds', data);
    return this.http.delete(BackendService.EMPLOYEE_URL + "/access", { headers: headers, params: httpParams , responseType: 'text'});
  }

  public getClientTestPaper(clientId, gradeId, subjectId) {
    return this.http.get(BackendService.CLIENT + "/" + clientId + "/" + "grade" + "/" + gradeId + "/" + "subject" + "/" + subjectId + "/" + "testPaper", {
      responseType: 'json'
    });
  }

  public deleteCommunicationDetails(communicationId)
  {
    const headers = new HttpHeaders();
    let httpParams = new HttpParams()

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    httpParams = httpParams.set('communicationId', communicationId);

    return this.http.delete(BackendService.COMMUNICATION   , {params: httpParams,
      headers: new HttpHeaders({
        'Content-type': 'application/json'
      }), responseType: 'text'
    });
  }

  public getTestPaperPreview(testPaperId, isFrozen) {
    return this.http.get(BackendService.CLIENT + "/" + "testPaper" + '/' + testPaperId + '/' + "frozen" + "/" + isFrozen);
  }

  public deleteQuestion(questionId) {
    return this.http.delete(BackendService.QUESTION_PAPER + "/" + questionId, { responseType: 'text' });
  }

  public downloadAttachment(source, id) {
    return this.http.get(BackendService.BKEND_URL + source + "/" + id + "/" + "download", { responseType: 'blob' });
  }

  public getClientYear(clientId, type) {
    return this.http.get(BackendService.CLIENT + "/" + clientId + "/" + type + "/" + "year");
  }

  public getClientTerm(clientId, clientYearId) {
    return this.http.get(BackendService.CLIENT + "/" + clientId + "/" + "year" + "/" + clientYearId + "/" + "term");
  }

  public postClientTerm(termDetails, clientId, createUserId) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    return this.http.post(BackendService.CLIENT + "/" + clientId + "/" + "term" + "/" + "user" + "/" + createUserId, termDetails, { headers: headers, responseType: 'text' });
  }

  public putClientTerm(termDetails, clientId, createUserId) {
    return this.http.put(BackendService.CLIENT + "/" + clientId + "/" + "term" + "/" + "user" + "/" + createUserId, termDetails, { responseType: 'text' });
  }

  public deleteClientTerm(termId) {
    return this.http.delete(BackendService.CLIENT + "/" + "term" + "/" + termId + "/" + "delete", { responseType: 'text' });
  }

  public postClientYear(clientYear) {
    return this.http.post(BackendService.CLIENT + "/" + "year", clientYear, { responseType: 'text' });
  }


  public postClientSubject(clientId, currentUserId, subjectData) {
    return this.http.post(BackendService.CLIENT.concat("/" + clientId + "/" + "user" + "/" + currentUserId + "/" + "subject"), subjectData, { responseType: 'json' });
  }

  public putClientSubject(clientId, currentUserId, subjectData) {
    return this.http.put(BackendService.CLIENT.concat("/" + clientId + "/" + "user" + "/" + currentUserId + "/" + "subject"), subjectData, { responseType: 'text' });
  }

  public getClientSubjectGroup(clientId, clientYearId, gradeId, pageName) {
    return this.http.get(BackendService.CLIENT.concat("/" + clientId + "/" + "year" + "/" + clientYearId + "/" + "grade" + "/" + gradeId + "/" + "subject" + "/" + pageName))
  }

  public postClientSubjectGroup(clientId, currentUserId, subjectGroupData) {
    return this.http.post(BackendService.CLIENT.concat("/" + clientId + "/" + "user" + "/" + currentUserId + "/" + "subject-group"), subjectGroupData, { responseType: 'json' });
  }

  public putClientSubjectGroupName(clientId, currentUserId, subjectGroupData) {
    return this.http.put(BackendService.CLIENT.concat("/" + clientId + "/" + "user" + "/" + currentUserId + "/" + "subject-group"), subjectGroupData, { responseType: 'text' });
  }

  public putClientSubjectGroupSubject(currentUserId, subjectGroupSubjectData) {
    return this.http.put(BackendService.CLIENT.concat("/" + "user" + "/" + currentUserId + "/" + "subject-group" + "/" + "subject"), subjectGroupSubjectData, { responseType: 'json' });
  }

  public deleteClientSubjectGroup(gradeId, subjectGroupId) {
    return this.http.delete(BackendService.CLIENT.concat("/" + "grade" + "/" + gradeId + "/" + "subject-group" + "/" + subjectGroupId + "/" + "delete"), { responseType: 'text' });
  }

  public getSubjectGroupData(clientId) {
    return this.http.get(BackendService.CLIENT.concat("/" + clientId + "/" + "subject-group"), { responseType: 'json' });
  }

  public getStudentPromotionData(clientId, clientYarOrder) {
    return this.http.get(BackendService.CLIENT.concat("/" + clientId + "/" + "year-order" + "/" + clientYarOrder + "/" + "student-promotion"), { responseType: 'json' });
  }

  public getStudentDetails(clientId, currentYearOrder, type, gradeOrDivisionId, nextYearOrder) {
    return this.http.get(BackendService.CLIENT.concat("/" + clientId + "/" + "year-order" + "/" + currentYearOrder + "/" + type + "/" + gradeOrDivisionId + "/" + "student-promotion" + "/" + "next-year-order" + "/" + nextYearOrder), { responseType: 'json' });
  }

  public getStudentDetailsByGradeOrDivision(clientId, clientYearId, type, gradeOrDivisionId) {
    return this.http.get(BackendService.CLIENT.concat("/" + clientId + "/" + "year" + "/" + clientYearId + "/" + type + "/" + gradeOrDivisionId + "/" + "students"), { responseType: 'json' });
  }

  public postStudentDetails(studentData) {
    return this.http.post(BackendService.CLIENT.concat("/" + "student-promotion"), studentData, { responseType: 'json' });
  }

  public deleteStudentDetails(studentId, studentGradeId) {
    return this.http.delete(BackendService.CLIENT.concat("/" + "grade" + "/" + studentGradeId + "/" + "student" + "/" + studentId + "/" + "delete"), { responseType: 'text' });
  }

  public updateStudentGroup(studentData, type) {
    return this.http.put(BackendService.CLIENT.concat("/" + "student-subject-group" + "/" + "update" + "/" + type), studentData, { responseType: 'text' });
  }

  public generateStudentRollNo(studentData) {
    return this.http.post(BackendService.CLIENT.concat("/" + "student" + "/" + "generate-roll-no"), studentData, { responseType: 'text' });
  }

  public updateStudentRollNo(studentData) {
    return this.http.put(BackendService.CLIENT.concat("/" + "student" + "/" + "update" + "/" + "roll-no"), studentData, { responseType: 'text' });
  }

  public getClientLogo(clientInternalName) {
    return this.http.get(BackendService.CLIENT.concat("/logo/" + clientInternalName));
  }
  public getNotice(data, communicationType, role) {
    if (role === 'Teacher') {
      return this.http.get(BackendService.COMMUNICATION.concat("/" + "client" + "/" + data.clientId + "/" + "role" + "/" + role + "/" + communicationType + "/" + "from-date" + "/" + data.fromDate + "/" + "to-date" + "/" + data.toDate));
    } else {
      return this.http.get(BackendService.COMMUNICATION.concat("/" + "client" + "/" + data.clientId + "/" + "year" + "/" + data.clientYearId + "/" + "role" + "/" + role + "/" + "grade" + "/" + data.gradeId + "/" + communicationType + "/" + "from-date" + "/" + data.fromDate + "/" + "to-date" + "/" + data.toDate));
    }
  }

  public getTeacherStudentNotice(data, communicationType, role) {
    if (role === 'Teacher') {
      return this.http.get(BackendService.COMMUNICATION.concat("/" + "client" + "/" + data.clientId + "/" + "role" + "/" + role + "/" + communicationType + "/" + "from-date" + "/" + data.fromDate + "/" + "to-date" + "/" + data.toDate + "/" + "year" + "/" + data.clientYearId + "/" + "grade" + "/" + data.gradeId + "/" + "division" + "/" + data.gradeDivisionId + "/" + "student" + "/" + data.studentGradeId));
    } else {
      return this.http.get(BackendService.COMMUNICATION.concat("/" + "client" + "/" + data.clientId + "/" + "year" + "/" + data.clientYearId + "/" + "role" + "/" + role + "/" + "grade" + "/" + data.gradeId + "/" + communicationType + "/" + "from-date" + "/" + data.fromDate + "/" + "to-date" + "/" + data.toDate));

    }
  }

  public getCommunicationStudentDetail(communicationId) {
    return this.http.get(BackendService.COMMUNICATION.concat("/" + communicationId));
  }

  // Insert student details while on-boarding
  public postStudentDetailsObboardingProcess(data) {
    return this.http.post(BackendService.STUDENTS_URL.concat("/" + "create"), data, { responseType: 'text' });
  }

  public putStudentDetailsObboardingProcess(data) {
    return this.http.put(BackendService.STUDENTS_URL.concat("/" + "update"), data, { responseType: 'text' });
  }

  public getUserPicture(clientId, userId) {
    return this.http.get(BackendService.BKEND_URL.concat("client" + "/" + clientId + "/" + "user" + "/" + userId + "/" + "picture"), { responseType: 'text' });
  }

  public getStartNewYearData() {
    return this.http.get(BackendService.START_NEW_YEAR, { responseType: 'text' });
  }

  public putCloseSession(gradeId) {
    return this.http.put(BackendService.CLOSE_SESSION, {'gradeId': gradeId}, { responseType: 'text' });
  }

  public putStartNewYear(override: boolean) {
    return this.http.put(BackendService.START_NEW_YEAR, {'override': override}, { responseType: 'text' });
  }

  public getYearGradeDivisionSubject(bypassAcl, bypassAclShowAll) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('bypass', bypassAcl);
    httpParams = httpParams.set('bypassShowAll', bypassAclShowAll);
    return this.http.get(BackendService.GRADES_API.concat( "/" + "gradeDivisionSubject"), { params: httpParams, responseType: 'json'});
  }

  public getGradeSubject() {
    return this.http.get(BackendService.GRADES_API.concat( "/" + "gradeSubject"), { responseType: 'json'});
  }

  public getClientSubjects() {
    return this.http.get(BackendService.SUBJECT_URL, { responseType: 'json'})
  }

  public getExamResultView(grade, division, termExamId, subject) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('grade', grade)
    httpParams = httpParams.set('division', division)
    httpParams = httpParams.set('subject', subject)
    httpParams = httpParams.set('term_exam_id', termExamId)
    return this.http.get(BackendService.EXAM_RESULT_VIEW, { params: httpParams, responseType: 'json' });
  }

  public getTermExams(gradeId, termId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('gradeId', gradeId);
    httpParams = httpParams.set('termId', termId);
    return this.http.get(BackendService.TERMS_API.concat( "/" + "termExams"), { params: httpParams, responseType: 'json'});
  }

  public getYearlyStudentExams(gradeId, studentGradeId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('gradeId', gradeId);
    httpParams = httpParams.set('studentGradeId', studentGradeId);

    return this.http.get(BackendService.EXAM_URL_2.concat( "/" + "yearlyStudentExams"), { params: httpParams, responseType: 'json'});
  }

  public getYearlyStudentAccomplishments(studentId, clientYearId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('studentId', studentId);
    httpParams = httpParams.set('clientYearId', clientYearId);

    return this.http.get(BackendService.ACCOMPLISHMENTS_URL_2.concat( "/" + "yearlyStudentAccomplishments"), { params: httpParams, responseType: 'json'});
  }

  public getYearlyStudentRemarks(studentGradeId, clientYearId) {
    let httpParams = new HttpParams()
    httpParams = httpParams.set('clientYearId', clientYearId);
    httpParams = httpParams.set('studentGradeId', studentGradeId);

    return this.http.get(BackendService.COMMUNICATION + "/yearlyStudentRemarks", { params: httpParams, headers: new HttpHeaders({
          'Content-type': 'application/json'
        }), responseType: 'json' });
  }
}
