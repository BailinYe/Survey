import {QuestionType} from "../enums/QuestionType";

// Defines the base interface for every question type
export interface QuestionBaseDTO {
    surveyId: string;   // References a survey using the surveyId
    questionId: string;  // Q# -> q1, q2, eq3, etc....
    position: number;   // from 0, 1, 2, ..., n-1
    type: QuestionType;
    prompt: string;  // Actual question prompt
    description?: string;  // Optional, can be used to give extra details for each question
    required: boolean;  // true for required, false for optional
}

// Example collection of Question Objects

    // const questions: QuestionDTO[] = [
    //     {
    //         surveyId: "survey_001",
    //         questionId: "q1",
    //         position: 0,
    //         type: QuestionType.MultipleChoice,
    //         prompt: "How did you hear about this event?",
    //         description: "Choose one option",
    //         required: true,
    //         options: ["Instagram", "Facebook", "Friend", "Other"]
    //     },
    //     {
    //         surveyId: "survey_001",
    //         questionId: "q2",
    //         position: 1,
    //         type: QuestionType.CheckBox,
    //         prompt: "What did you like about the event?",
    //         description: "You may select more than one option.",
    //         required: false,
    //         options: ["Organization", "Food", "Music", "Venue"],
    //         minSelect: 1,
    //         maxSelect: 3
    //     },
    //     {
    //         surveyId: "survey_001",
    //         questionId: "q3",
    //         position: 2,
    //         type: QuestionType.ShortAnswer,
    //         prompt: "What could we improve for next time?",
    //         description: "Write a short comment.",
    //         required: false
    //     },
    //     {
    //         surveyId: "survey_001",
    //         questionId: "q4",
    //         position: 3,
    //         type: QuestionType.Rating,
    //         prompt: "How would you rate the overall experience?",
    //         description: "Rate from 1 to 5.",
    //         required: true,
    //         scaleMin: 1,
    //         scaleMax: 5,
    //         labelMin: "Poor",
    //         labelMax: "Excellent"
    //     }
    // ];


// Defines a MultipleChoiceDTO extending from QuestionBaseDTO interface
export interface MultipleChoiceDTO extends QuestionBaseDTO {
    type: QuestionType.MultipleChoice;
    options: string[];
}

// Example of MultipleChoice Question Object

    // const multipleChoiceQuestion: MultipleChoiceDTO = {
    //     surveyId: "survey_001",
    //     questionId: "q1",
    //     position: 0,
    //     type: QuestionType.MultipleChoice,
    //     prompt: "How did you hear about this event?",
    //     description: "Choose one option",
    //     required: true,
    //     options: ["Instagram", "Facebook", "Friend", "Other"]
    // };


// Defines extra instances for ChecBoxDTO extending from QuestionBaseDTO interface
export interface CheckBoxDTO extends QuestionBaseDTO {
    type: QuestionType.CheckBox;
    options: string[];
    minSelect?: number;
    maxSelect?: number;
}

// Example of CheckBox Question Object

    // const checkBoxQuestion: CheckBoxDTO = {
    //     surveyId: "survey_001",
    //     questionId: "q2",
    //     position: 1,
    //     type: QuestionType.CheckBox,
    //     prompt: "What did you like about the event?",
    //     description: "You may select between 1 and 3 options",
    //     required: false,
    //     options: ["Organization", "Food", "Music", "Venue"],
    //     minSelect: 1,
    //     maxSelect: 3
    // };



// Defines or assigns instances for shortAnswerDTO extending from QuestionBaseDTO interface
export interface ShortAnswerDTO extends QuestionBaseDTO {
    type: QuestionType.ShortAnswer;
}

// Example of ShortAnswer Question Object

    // const shortAnswerQuestion: ShortAnswerDTO = {
    //     surveyId: "survey_001",
    //     questionId: "q3",
    //     position: 2,
    //     type: QuestionType.ShortAnswer,
    //     prompt: "What could we improve for next time?",
    //     description: "Write a short comment.",
    //     required: false
    // };



// Defines extra instances for RatingDTO extending from QuestionBaseDTO interface
export interface RatingDTO extends QuestionBaseDTO {
    type: QuestionType.Rating;
    scaleMin: number;
    scaleMax: number;
    labelMin?: string;
    labelMax?: string;
}

// Example of Rating Question Object

    // const ratingQuestion: RatingDTO = {
    //     surveyId: "survey_001",
    //     questionId: "q4",
    //     position: 3,
    //     type: QuestionType.Rating,
    //     prompt: "How would you rate the overall experience?",
    //     description: "Rate from 1 to 5.",
    //     required: true,
    //     scaleMin: 1,
    //     scaleMax: 5,
    //     labelMin: "Poor",
    //     labelMax: "Excellent"
    // };


export type QuestionDTO = | MultipleChoiceDTO | CheckBoxDTO | ShortAnswerDTO | RatingDTO;