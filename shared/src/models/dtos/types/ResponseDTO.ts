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

// Example of Response Object (1 object for the whole Survey)

    // const response: ResponseDTO = {
    //     surveyId: "survey_001",
    //     submittedAt: "2026-03-20T19:30:00Z",
    //     answers: {
    //         q1: {
    //             type: QuestionType.MultipleChoice,
    //             value: "Instagram"
    //         },
    //         q2: {
    //             type: QuestionType.CheckBox,
    //             value: ["Organization", "Music"]
    //         },
    //         q3: {
    //             type: QuestionType.ShortAnswer,
    //             value: "Everything was well organized."
    //         },
    //         q4: {
    //             type: QuestionType.Rating,
    //             value: 5
    //         }
    //     }
    // };


