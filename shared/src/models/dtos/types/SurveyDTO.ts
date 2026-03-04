
import {BaseDTO} from "./BaseDTO";
import {SurveyStatus} from "../enums/SurveyStatus";

export interface SurveyDTO extends BaseDTO {
    authorId: string;
    title: string;
    description: string;
    status: SurveyStatus;
    questionCount: number;
}


