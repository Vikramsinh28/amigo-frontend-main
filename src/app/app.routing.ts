import { EmployeeSearchComponent } from './employee-access/employee-search/employee-search.component';

/*
Routing for the Angular app is configured as an array of Routes,
each component is mapped to a path so the Angular Router knows
which component to display based on the URL in the browser address bar.

The Routes array is passed to the RouterModule.forRoot() method
which creates a routing module with all of the app routes configured,
and also includes all of the Angular Router providers and directives such as the <router-outlet>
*/

import { Routes, RouterModule } from '@angular/router';
import {AuthGuard as AuthGuard} from './_helpers';
import {RoleGuardService as RoleGuard} from './_helpers/role-guard.service';
import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { GradePerformanceComponent } from './visualizations';
import { AccomplishmentListComponent } from './accomplishment';
import { GradePerformanceTrendComponent } from './visualizations/grade-performance-trend.component';
import { StudentPerformanceComponent } from './visualizations/student-performance.component';
import { TenPointsSummaryComponent } from './ten-points-summary';
import { StudentProfileComponent } from './student-profile';
import { QuestionBankComponent } from './question-bank';
import { PaperComponent } from './paper';
import { StudentTestListComponent } from './student-test/student-test-list/student-test-list.component';
import { ClientManagementListComponent } from './client-management/client-management-list/client-management-list.component';
import { ClientOnboardingStepperComponent } from './client-onboarding/client-onboarding-stepper/client-onboarding-stepper.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { EvaluationComponent } from './test/evaluation/evaluation.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ChapterTopicComponent } from './chapter-topic/chapter-topic.component';
import { ExamManagementComponent } from './exam-management/exam-management.component';
import { TestComponent } from './test/test.component';
import { TermYearComponent } from './term-year/term-year.component';
import { GradeDivisionComponent } from './grade-division/grade-division.component';
import { SubjectSubjectGroupComponent } from './subject-subject-group/subject-subject-group.component';
import { StudentPromotionComponent } from './student-promotion/student-promotion.component';
import { StudentSubjectgroupAssignmentComponent } from './student-subjectgroup-assignment/student-subjectgroup-assignment.component';
import { StudentRollNoGenerationComponent } from './student-roll-no-generation/student-roll-no-generation.component';
import { StartNewYearComponent } from './_components/start-new-year/start-new-year.component';
import { AssignmentComponent } from './communication/assignment/assignment.component';
import { NoticeBoardComponent } from './communication/notice-board/notice-board.component';
import { RemarkComponent } from './communication/remark/remark.component';
import { UpcomingEventsComponent } from './communication/upcoming-event/upcoming-event.component';
import { StudentTestPaperComponent } from './student-test/student-test-paper/student-test-paper.component';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { ExamMarksViewEditComponent } from './exam-management/exam-marks-view-edit/exam-marks-view-edit.component';
import { StudentYearlyOverviewComponent } from './student-yearly-overview/student-yearly-overview.component';
import { TestAnalyticsComponent } from './visualizations/test-analytics/test-analytics.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  { path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'student-performance-subjectwise/:type',
    component: StudentPerformanceComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'grade-performance-trend',
    component: GradePerformanceTrendComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'student-performance/:type',
    component: StudentPerformanceComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'grade-performance',
    component: GradePerformanceComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'accomplishment/:type',
    component: AccomplishmentListComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'tenpointssummary',
    component: TenPointsSummaryComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'student-profile',
    component: StudentProfileComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'question-bank',
    component: QuestionBankComponent,
    canActivate: [RoleGuard],
  },
  { path: 'setup-paper',
    component: PaperComponent,
    canActivate: [RoleGuard],
  },
  { path: 'setup-test',
    component: TestComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'student-test-list',
    component: StudentTestListComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'student-test-paper',
    component: StudentTestPaperComponent,
    canActivate: [RoleGuard],
    data: {
      exceptionRole: 'Student'
    }
  },
  {
    path: 'client-management',
    component: ClientManagementListComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'client-onboarding',
    component: ClientOnboardingStepperComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'coming-soon',
    component: ComingSoonComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'test-evaluation',
    component: EvaluationComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'user-management',
    component: UserManagementComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'chapter-topic',
    component: ChapterTopicComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'exam-management',
    component: ExamManagementComponent,
    canActivate: [RoleGuard],
  },
   {
     path: 'assignment',
     component: AssignmentComponent,
     canActivate: [RoleGuard],
   },
  { path: 'term-year',
    component: TermYearComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'grade-division',
    component: GradeDivisionComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'subject-group',
    component: SubjectSubjectGroupComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'student-promotion',
    component: StudentPromotionComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'student-subjectgroup',
    component: StudentSubjectgroupAssignmentComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'student-rollNo',
    component: StudentRollNoGenerationComponent,
    canActivate: [RoleGuard],
  },
  {
     path: 'notice-board',
     component: NoticeBoardComponent,
     canActivate: [RoleGuard],
   },
   {
    path: 'upcoming-event',
    component: UpcomingEventsComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'teacher-student-notice',
    component: RemarkComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'start-new-year',
    component: StartNewYearComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    //canActivate: [RoleGuard],
  },
  {
    path: 'employee-access',
    component: EmployeeSearchComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'exam-result-view',
    component: ExamMarksViewEditComponent,
    canActivate: [RoleGuard],
  },
  {
    path: 'student-yearly-overview',
    component: StudentYearlyOverviewComponent,
    // canActivate: [RoleGuard],
  },
  {
    path: 'test-analytics',
    component: TestAnalyticsComponent,
    // canActivate: [RoleGuard],
  },
  { path: '**',
  redirectTo: '',
  canActivate: [AuthGuard] },
];

export const AppRoutingModule = RouterModule.forRoot(routes);
