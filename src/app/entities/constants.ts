export const  COMBINED_SUBJECT = {
    subjectId   : -1,
    subjectName : 'Combined',
    selected    : true 
  }

export enum MODE_AP {
  STUDENT = 0,
  STUDENT_PROFILE = 1,
  TEACHER = 2
}

export const MONTHS = ['January', 'February', 'March', 
                       'April', 'May', 'June', 
                       'July', 'August', 'September', 
                       'October', 'November', 'December'
                      ]

export enum QUESTION_TYPE {
  MULTI_QUESTION_GROUP = 1,
  SINGLE_SELECT_MCQ = 2,
  MULTI_SELECT_MCQ = 3,
  VERY_SHORT_QUESTION = 4,
  SHORT_QUESTION = 5,
  LONG_QUESTION = 6,
  FILL_IN_THE_BLANKS = 7
}

export enum DIFFICULTY_LEVEL {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
  NOT_SPECIFIED = 4
}

export enum EXAM_STATUS {
  CREATED = 0,
  NOTIFY_STUDENT = 1,
  OPEN = 2,
  CLOSED = 3,
  EVALUATE = 4,
  SCORE_RELEASED = 5,
}


export const  EXAM_STATUS_LIST: string = '1,2,3,4,5';