import { Attachment } from './attachment';
import { StudentTestPaperAnswer } from './studentTestPaperAnswers';

export interface StudentTestPaperResponse {
    studentGradeId ?: number,
    testPaperId    ?: number,
    studentExamId  ?: number,
    finalSubmit    ?: boolean,
    studentAnswers ?: StudentTestPaperAnswer[],
    studentAttachments ?: Attachment[]
}