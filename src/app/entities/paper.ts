import { PaperQuestion } from './paper-question';

export interface Paper {
    'rowNum' ?: number,
    'testPaperId'? : number,
    'paperName' ?: string,
    'testPaperName' ?: string, // This is same as papername.. but in some APIs value is returned as testPaperName
    'grade' : string,
    'subject' : string,
    'subjectId': number,
    'questions'? : PaperQuestion[],
    'isFrozen' : number,
    'clientId' : number,
    'totalMarks' : string,
    'createdUser' : number,
    'createdUserName' ?: number,
    'chapters' ?: string,
    'topics' ?: string,
    'modifiedDate' ?: string,
    'modifiedUser' ?: string
}