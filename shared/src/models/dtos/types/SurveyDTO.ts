
import {SurveyStatus} from "../enums/SurveyStatus";

export interface SurveyDTO {
    id: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    description: string;
    status: SurveyStatus;
    questionCount: number;
}

// Sample Survey Object:

    // const survey: SurveyDTO = {
    //     id: "survey_001",
    //     authorId: "user_123",
    //     createdAt: "2026-03-20T18:00:00Z",
    //     updatedAt: "2026-03-20T18:30:00Z",
    //     title: "Customer Satisfaction Survey",
    //     description: "A survey to collect feedback about the event experience.",
    //     status: SurveyStatus.Active,
    //     questionCount: 4
    // };