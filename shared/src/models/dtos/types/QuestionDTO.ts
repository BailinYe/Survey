import {QuestionType} from "../enums/QuestionType";

// Defines the base interface for every question type
export interface QuestionBaseDTO {
    questionId: string;
    position: number;   // from 0, 1, 2, ..., n-1
    type: QuestionType;
    prompt: string;  // Actual question prompt
    description?: string;  // Optional, can be used to give extra details for each question
    required: boolean;  // true for required, false for optional
}


// Defines a MultipleChoiceDTO extending from QuestionBaseDTO interface
export interface MultipleChoiceDTO extends QuestionBaseDTO {
    type: QuestionType.MultipleChoice;
    options: string[];
}


// Defines extra instances for ChecBoxDTO extending from QuestionBaseDTO interface
export interface CheckBoxDTO extends QuestionBaseDTO {
    type: QuestionType.CheckBox;
    options: string[];
    minSelect?: number;
    maxSelect?: number;
}


// Defines or assigns instances for shortAnswerDTO extending from QuestionBaseDTO interface
export interface ShortAnswerDTO extends QuestionBaseDTO {
    type: QuestionType.ShortAnswer;
}


// Defines extra instances for RatingDTO extending from QuestionBaseDTO interface
export interface RatingDTO extends QuestionBaseDTO {
    type: QuestionType.Rating;
    scaleMin: number;
    scaleMax: number;
    labelMin?: string;
    labelMax?: string;
}


export type QuestionDTO = | MultipleChoiceDTO | CheckBoxDTO | ShortAnswerDTO | RatingDTO;