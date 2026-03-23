
import {SurveyStatus} from "../enums/SurveyStatus";

export interface SurveyDTO {
    id: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string;
    status: SurveyStatus;
    questionCount: number;
    answerCount: number;      // Total number of responses/answers submitted for this survey
    // sharedCount?: number;      // Count of unique people the survey has been shared with
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
    //     questionCount: 4,
    //     sharedCount: 25,        // 25 people invited
    //     answerCount: 18         // 18 responses received
    // };