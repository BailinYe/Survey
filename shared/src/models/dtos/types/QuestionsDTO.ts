import {QuestionType} from "../enums/QuestionType";
import {BaseDTO} from "./BaseDTO";


// Defines the base interface for every question type
export interface QuestionBaseDTO extends BaseDTO {
    surveyId: string;
    type: QuestionType;
    prompt: string;
    description?: string;
    required: boolean;
    position: number;
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



export type QuestionsDTO = | MultipleChoiceDTO | CheckBoxDTO | ShortAnswerDTO | RatingDTO;