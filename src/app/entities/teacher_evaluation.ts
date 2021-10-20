export interface Evaluation
{
    studentAnswerId? : number,
    marks? : number,
    result? : boolean,
    feedback? : string
}

export interface TeacherEvaluation {
    user_id?: number;
    exam_status?: number;
    isSubmit?: boolean;
    examId?        : number,
    studentExamId? : number,
    evaluations? : Evaluation[]
  }