import { CompileIdentifierMetadata } from "@angular/compiler";

export interface ClientSubject {
    subjectId?: number;
    clientId?: number;
    subjectName: string;
    category?: number;
    openForEdit?: boolean;
    undoValue?: any;

}

export interface ClientSubjectGroup extends ClientSubject {
    subjectGroupId?: number;
    gradeId?: number;
    groupCode?: string;
    isMandatory?: string;
    subjectGroupSubjectId?: number;
    isGroupNameEditable?: boolean;
    countSubjectGroupInUse?: number;

}


export interface SubjectGroupSubject extends ClientSubjectGroup {
    isSubjectGroupSubjectDeleted?: boolean;
    isSubjectGroupSubjectAdded?: boolean;
    subjectGroupSubjectDetails?: SubjectGroupSubject[];
}