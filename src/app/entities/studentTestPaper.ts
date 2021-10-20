import { Question } from './question';
import { Client } from './client';
export interface StudentTestPaper
{
    'client_info' : Client,
    'questions' : Question[]
}