
import {SurveyStatus} from "../enums/SurveyStatus";
import {QuestionDTO} from "./QuestionDTO";

export interface SurveyDTO {
    id: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    expiredAt: Date;
    title: string;
    description: string;
    status: SurveyStatus;
    questionCount: number;
    answerCount: number;
    sharedCount: number;
    emails: string[];
    questions: QuestionDTO[];
}