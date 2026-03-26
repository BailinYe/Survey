import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";
import { QuestionType } from "@shared/models/dtos/enums/QuestionType";
import { ResponseDTO } from "@shared/models/dtos/types/ResponseDTO";
import type { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";

export const Survey: SurveyDTO = {
    id: "survey_001",
    authorId: "user_123",
    createdAt: new Date("2026-03-20T18:00:00Z"),
    updatedAt: new Date("2026-03-20T18:30:00Z"),
    title: "Customer Satisfaction Survey",
    description: "A survey to collect feedback about the event experience.",
    status: SurveyStatus.Active,
    questionCount: 4,
    answerCount: 18,
    sharedCount: 4,
    emails: ["email1@test.com", "email2@test.com", "email3@test.com"],
    questions: [
        {
            questionId: "q1",
            position: 1,
            type: QuestionType.MultipleChoice,
            prompt: "How would you rate the event overall?",
            description: "Select one option",
            required: true,
            options: ["Excellent", "Good", "Average", "Poor"],
        },
        {
            questionId: "q2",
            position: 2,
            type: QuestionType.CheckBox,
            prompt: "Which parts of the event did you enjoy?",
            description: "Select all that apply",
            required: false,
            options: ["Speakers", "Food", "Networking", "Venue"],
            minSelect: 1,
            maxSelect: 2,
        },
        {
            questionId: "q3",
            position: 3,
            type: QuestionType.ShortAnswer,
            prompt: "What could we improve?",
            description: "Write a short comment",
            required: false,
        },
        {
            questionId: "q4",
            position: 4,
            type: QuestionType.Rating,
            prompt: "Rate the organization of the event",
            description: "select one option",
            required: true,
            scaleMin: 1,
            scaleMax: 5,
            labelMin: "very poor",
            labelMax: "excellent",
        }
    ],
};

export const SurveyResponses: ResponseDTO[] = [
    {
        surveyId: "survey_001",
        submittedAt: new Date("2026-03-20T19:30:00Z"),
        answers: {
            q1: { type: QuestionType.MultipleChoice, value: "Instagram" },
            q2: { type: QuestionType.CheckBox, value: ["Organization", "Music"] },
            q3: { type: QuestionType.ShortAnswer, value: "Everything was well organized." },
            q4: { type: QuestionType.Rating, value: 5 },
        },
    },
    {
        surveyId: "survey_001",
        submittedAt: new Date("2026-03-20T20:10:00Z"),
        answers: {
            q1: { type: QuestionType.MultipleChoice, value: "Friend" },
            q2: { type: QuestionType.CheckBox, value: ["Food", "Venue"] },
            q3: { type: QuestionType.ShortAnswer, value: "The venue was nice." },
            q4: { type: QuestionType.Rating, value: 4 },
        },
    },
    {
        surveyId: "survey_001",
        submittedAt: new Date("2026-03-21T09:00:00Z"),
        answers: {
            q1: { type: QuestionType.MultipleChoice, value: "Facebook" },
            q2: { type: QuestionType.CheckBox, value: ["Music", "Food"] },
            q3: { type: QuestionType.ShortAnswer, value: "More seating would help." },
            q4: { type: QuestionType.Rating, value: 3 },
        },
    },
];