import { Attachment } from './attachment';
export interface StudentTestPaperAnswer {
    testPaperQuestionId ?: number,
    answer              ?: any,
    attachments         ?: Attachment[],

}