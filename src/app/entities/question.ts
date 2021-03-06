export interface Question {
  'position'?: number;
  'grade': string,
  'subject': string,
  'qb_question_id': number,
  'chapter_id': number,
  'topic_id': number,
  'skill': string,
  'qb_question_type_id': number,
  'indicative_marks': number,
  'actual_marks'?: number,
  'qb_difficulty_level_id': number,
  'Difficulty Level': string,
  'average_minutes': number,
  'question_attachment_file_name': string,
  'objective_answers': any,
  'subjective_answer': string,
  'Question Type': string,
  'Chapter': string,
  'Topic': string,
  'Question': string,
  'QuestionTextExtract' ?: string,
  'keywords': string,
  'question_attachment': any,
  'answer_attachment': any,
  'create_user': string,
  'update_user': string,
  'create_user_id': number
}