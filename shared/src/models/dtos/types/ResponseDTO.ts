import {QuestionType} from "../enums/QuestionType";

export type AnswerValue =
    | {
        type: QuestionType.MultipleChoice;
        value: string;
    } | {
        type: QuestionType.CheckBox;
        value: string[];
    } | {
        type: QuestionType.ShortAnswer;
        value: string;
    } | {
        type: QuestionType.Rating;
        value: number;
    };

export interface ResponseDTO {
    surveyId: string;   // References a survey using the surveyId
    submittedAt: Date;
    answers: Record<string, AnswerValue>; // questionId -> AnswerValue   ( Q1, AnswerValue Object )
}