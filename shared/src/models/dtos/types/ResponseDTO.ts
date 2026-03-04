import {BaseDTO} from "./BaseDTO";
import {QuestionType} from "../enums/QuestionType";


// answers: {
//   "Q1": { type: "short_answer", value: "Hello" },
//   "Q2": { type: "rating", value: 4 },
//   "Q3": { type: "checkbox", value: ["A", "C"] }
// }

export type AnswerValue = | {
        type: QuestionType.MultipleChoice,
        value?: QuestionType
    } | {
        type: QuestionType.CheckBox,
        value?: QuestionType
    } | {
        type: QuestionType.ShortAnswer,
        value?: QuestionType
    } | {
        type: QuestionType.Rating,
        value?: QuestionType
    }
;

export interface ResponseDTO extends BaseDTO {
    surveyId: string;
    submittedAt: string;
    // questionId -> AnswerValue
    answers: Record<string, AnswerValue>;
}

