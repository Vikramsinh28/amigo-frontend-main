import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from './material/material.module';


import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { AppRoutingModule } from './app.routing';
import { LoginComponent } from './login';
import { AppComponent } from './app.component';

import { MenuItemComponent } from './menu-item';
import { HomeComponent } from './home';
import { StudentPerformanceComponent, GradePerformanceComponent } from './visualizations';
import { StudentSearchComponent } from './student-search';
import { ClassSearchComponent } from './class-search';
import { AccomplishmentComponent, AccomplishmentListComponent } from './accomplishment'
import { GradePerformanceTrendComponent } from './visualizations/grade-performance-trend.component';
import { SidenavComponent } from './menu-item/sidenav/sidenav.component';
import { TenPointsSummaryComponent } from './ten-points-summary';
import { StudentProfileComponent, EditProfileBioComponent } from './student-profile';
import { DegreeAndCertificationComponent } from './degree-and-certification/degree-and-certification.component'
import { QuestionBankComponent, AnswerOptionComponent, QuestionBankListComponent, QuestionBankAddEditComponent } from './question-bank';
import { TestListComponent } from './test/test-list/test-list.component';
import { TestUpdateComponent } from './test/test-setup/test-setup.component';
import { PaperSetupComponent } from './paper/paper-setup/paper-setup.component';
import { PaperListComponent } from './paper';
import { PaperComponent } from './paper';
import { StudentTestListComponent } from './student-test/student-test-list/student-test-list.component';
import { DigitOnlyDirective } from './_helpers/digit-only.directive';
import { FloatOnlyDirective } from './_helpers/float-only.directive';
import { StudentTestPaperComponent } from './student-test/student-test-paper/student-test-paper.component';
import { ImageCropperComponent } from './student-profile/image-cropper/image-cropper.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FileUploadComponent } from './_components/file-upload/file-upload/file-upload.component';
import { EvaluationComponent } from './test/evaluation/evaluation.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ClientManagementListComponent } from './client-management/client-management-list/client-management-list.component';
import { ClientManagementAddEditComponent } from './client-management/client-management-add-edit/client-management-add-edit.component';
import { YearsTermsListComponent } from './client-onboarding/years-terms-list/years-terms-list.component';
import { YearsTermsAddEditComponent } from './client-onboarding/years-terms-add-edit/years-terms-add-edit.component';
import { ClientOnboardingStepperComponent } from './client-onboarding/client-onboarding-stepper/client-onboarding-stepper.component';
import { CountdownModule } from 'ngx-countdown';
import { GradeAndDivisionComponent } from './client-onboarding/grade-and-division/grade-and-division.component';
import { CanDeactivateGuard } from './_helpers/can-deactivate/can-deactivate.guard';
import { UserManagementComponent } from './user-management/user-management.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { StudentUserComponent } from './user-management/student-user/student-user.component';
import { EmployeeUserComponent } from './user-management/employee-user/employee-user.component';
import { ChapterTopicComponent } from './chapter-topic/chapter-topic.component';
import { AddChapterDialogComponent } from './chapter-topic/add-chapter-dialog/add-chapter-dialog.component';
import { ExamManagementComponent } from './exam-management/exam-management.component';
import { EvaluationPaperComponent } from './test/evaluation/evaluation-paper/evaluation-paper.component';
import { StudentPaperEvaluatedComponent } from './test/evaluation/student-paper-evaluated/student-paper-evaluated.component';
import { TestChapterTopicReportComponent } from './visualizations/test-chapter-topic-report/test-chapter-topic-report.component';
import { TestCtReportComponent } from './test/test-ct-report/test-ct-report.component';

import { AttachmentPreviewComponent } from './_components/attachment-preview/attachment-preview.component';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CustomDateAdapter } from './_services/date-time/customDateTimeAdapter';
import { DateAdapter } from '@angular/material/core';
import { PaperPreviewDialogBoxComponent } from './_components/paper-preview-dialog-box/paper-preview-dialog-box.component';
import { TestChapterTopicGraphComponent } from './visualizations/test-chapter-topic-graph/test-chapter-topic-graph.component';
import { StudentTestReportGraphComponent } from './student-test/student-test-report-graph/student-test-report-graph.component';
import { TestComponent } from './test/test.component';
import * as jsonpath from 'jsonpath';
import { SpecialCharacter } from './_helpers/special-character';
import { AutoFocusDirective } from './_helpers/auto-focus.directive';
import { LightboxModule } from 'ngx-lightbox';
import { TermYearComponent } from './term-year/term-year.component';
import { GradeDivisionComponent } from './grade-division/grade-division.component';
import { SubjectSubjectGroupComponent } from './subject-subject-group/subject-subject-group.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StudentSubjectgroupAssignmentComponent } from './student-subjectgroup-assignment/student-subjectgroup-assignment.component';
import { StudentPromotionComponent } from './student-promotion/student-promotion.component';
import { StudentRollNoGenerationComponent } from './student-roll-no-generation/student-roll-no-generation.component';
import { TestListActiveComponent } from './test/test-list-active/test-list-active.component';
import { TestListCompletedComponent } from './test/test-list-completed/test-list-completed.component';
import { CommunicationAddEditComponent } from './communication/communication-add-edit/communication-add-edit.component';
import { CommunicationContentComponent } from './communication/communication-content/communication-content.component';
import { PaperPdfCustomizeComponent } from './_components/paper-pdf-customize/paper-pdf-customize.component';
import { RichTextEditor } from './_components/rich-text-editor/rich-text-editor.component';
import { MathModule } from './_helpers/math-display/math.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { StudentUserFiltersComponent } from './user-management/student-user/student-user-filters/student-user-filters.component';
import { UserManagementAddUserDialogBoxComponent } from './user-management/user-management-add-user-dialog-box/user-management-add-user-dialog-box.component';
import { EmployeeUserFilterComponent } from './user-management/employee-user/employee-user-filter/employee-user-filter.component';
import { StartNewYearComponent } from './_components/start-new-year/start-new-year.component';
import { StudentTestDialogBoxComponent } from './student-test/student-test-dialog-box/student-test-dialog-box.component';
import { CommonGradeDivisionComponent } from './_components/common-grade-division/common-grade-division.component';
import { AssignmentComponent } from './communication/assignment/assignment.component';
import { AssignmentListComponent } from './communication/assignment/assignment-list/assignment-list.component';
import { UpcomingEventsComponent } from './communication/upcoming-event/upcoming-event.component';
import { UpcomingEventsListComponent } from './communication/upcoming-event/upcoming-event-list/upcoming-event-list.component';
import { NoticeBoardComponent } from './communication/notice-board/notice-board.component';
import { RemarkComponent } from './communication/remark/remark.component';
import { NoticeBoardListComponent } from './communication/notice-board/notice-board-list/notice-board-list.component';
import { RemarkListComponent } from './communication/remark/remark-list/remark-list.component';
import { RemarkStudentListComponent } from './communication/remark/remark-student-list/remark-student-list.component';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { PreventCopyPasteDirective } from './_helpers/prevent-copy-paste.directive';
import { ReportIssueComponent } from './question-bank/report-issue/report-issue.component';
import { EmployeeSearchComponent } from './employee-access/employee-search/employee-search.component';
import { EmployeeAccessAddEditComponent } from './employee-access/employee-access-add-edit/employee-access-add-edit.component';
import { CommonPaginatorComponent } from './_components/common-paginator/common-paginator.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppUpdateService } from './_services/app-update.service';
import { CommonGradeSubjectComponent } from './_components/common-grade-subject/common-grade-subject.component';
import { ExamMarksViewEditComponent } from './exam-management/exam-marks-view-edit/exam-marks-view-edit.component';
import { PaperSetupChartDisplayComponent } from './visualizations/paper-setup-chart-display/paper-setup-chart-display.component';
import { StudentYearlyOverviewComponent } from './student-yearly-overview/student-yearly-overview.component';
import { StudentYearlyExamsComponent } from './student-yearly-overview/student-yearly-exams/student-yearly-exams.component';
import { StudentYearlyTestsComponent } from './student-yearly-overview/student-yearly-tests/student-yearly-tests.component';
import { StudentYearlyAchievementsParticipationComponent } from './student-yearly-overview/student-yearly-achievements-participation/student-yearly-achievements-participation.component';
import { StudentYearlyDegreeCertificationsComponent } from './student-yearly-overview/student-yearly-degree-certifications/student-yearly-degree-certifications.component';
import { StudentYearlyRemarksComponent } from './student-yearly-overview/student-yearly-remarks/student-yearly-remarks.component';
import { TestAnalyticsComponent } from './visualizations/test-analytics/test-analytics.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    MenuItemComponent,
    StudentPerformanceComponent,
    StudentSearchComponent,
    GradePerformanceComponent,
    ClassSearchComponent,
    AccomplishmentComponent,
    AccomplishmentListComponent,
    GradePerformanceTrendComponent,
    SidenavComponent,
    TenPointsSummaryComponent,
    StudentProfileComponent,
    EditProfileBioComponent,
    DegreeAndCertificationComponent,
    QuestionBankComponent,
    AnswerOptionComponent,
    QuestionBankListComponent,
    QuestionBankAddEditComponent,
    TestListComponent,
    TestUpdateComponent,
    PaperSetupComponent,
    PaperListComponent,
    PaperComponent,
    StudentTestListComponent,
    DigitOnlyDirective,
    FloatOnlyDirective,
    StudentTestPaperComponent,
    ImageCropperComponent,
    FileUploadComponent,
    EvaluationComponent,
    ClientManagementListComponent,
    ClientManagementAddEditComponent,
    YearsTermsListComponent,
    YearsTermsAddEditComponent,
    ClientOnboardingStepperComponent,
    GradeAndDivisionComponent,
    UserManagementComponent,
    ComingSoonComponent,
    StudentUserComponent,
    EmployeeUserComponent,
    ChapterTopicComponent,
    AddChapterDialogComponent,
    ExamManagementComponent,
    EvaluationPaperComponent,
    StudentPaperEvaluatedComponent,
    TestChapterTopicReportComponent,
    TestCtReportComponent,
    AttachmentPreviewComponent,
    PaperPreviewDialogBoxComponent,
    DeleteConfirmationDialogComponent,
    TestChapterTopicGraphComponent,
    StudentTestReportGraphComponent,
    TestComponent,
    SpecialCharacter,
    AutoFocusDirective,
    TermYearComponent,
    GradeDivisionComponent,
    SubjectSubjectGroupComponent,
    StudentSubjectgroupAssignmentComponent,
    StudentPromotionComponent,
    StudentRollNoGenerationComponent,
    TestListActiveComponent,
    TestListCompletedComponent,
    CommunicationAddEditComponent,
    PaperPdfCustomizeComponent,
    RichTextEditor,
    StudentUserFiltersComponent,
    UserManagementAddUserDialogBoxComponent,
    EmployeeUserFilterComponent,
    StartNewYearComponent,
    StudentTestDialogBoxComponent,
    CommonGradeDivisionComponent,
    CommunicationContentComponent,
    AssignmentComponent,
    AssignmentListComponent,
    UpcomingEventsComponent,
    UpcomingEventsListComponent,
    NoticeBoardComponent,
    RemarkComponent,
    NoticeBoardListComponent,
    RemarkListComponent,
    RemarkStudentListComponent,
    ChangePasswordComponent,
    PreventCopyPasteDirective,
    ReportIssueComponent,
    EmployeeSearchComponent,
    EmployeeAccessAddEditComponent,
    CommonPaginatorComponent,
    CommonGradeSubjectComponent,
    ExamMarksViewEditComponent,
    PaperSetupChartDisplayComponent,
    StudentYearlyOverviewComponent,
    StudentYearlyExamsComponent,
    StudentYearlyTestsComponent,
    StudentYearlyAchievementsParticipationComponent,
    StudentYearlyDegreeCertificationsComponent,
    StudentYearlyRemarksComponent,
    TestAnalyticsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule,
    ImageCropperModule,
    CountdownModule,
    LightboxModule,
    DragDropModule,
    MathModule,
    CKEditorModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
    // { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AuthenticationService] },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    NgxImageCompressService,
    CanDeactivateGuard,
    CanDeactivateGuard,
    CustomDateAdapter,
    AppUpdateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
