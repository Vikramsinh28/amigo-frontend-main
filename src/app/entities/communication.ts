import { AuditingFields } from './auditingFields';

export interface Communication extends AuditingFields {
    communicationId?: number;
    clientId?: number;
    type?: string;
    headline?: string;
    communicationText?: string;
    attachmentFileName?: string;
    attachment?: any;
    attachedPaperId?: number;
    attachedPaperName?: string;
    subjectId?: number;
    dueDate?: Date;
    subjectName?: string;
    isShared?: number;
    sharedDate?: Date;
    updateDate?: Date;
    grade?: string;
    division?: string;
    studentGradeDivisionId?: any;
    divisionName?: Array<string>;
    gradeDivisionId?: any;
    gradeId?: any;
    isImportant?: boolean;
    attachmentDeleteStatus?: any;
    gradeDivisionList?: string[];
    recipientCount?: number;
    studentGradeId?: any;
    remarkType?: number;
    updateUserName ?: string;
    eventCompleted ?: boolean;
}