// Shared DTO enums/types
import { QuestionType } from "@shared/models/dtos/enums/QuestionType";
import type {
    QuestionDTO,
    MultipleChoiceDTO,
    CheckBoxDTO,
    ShortAnswerDTO,
    RatingDTO,
} from "@shared/models/dtos/types/QuestionDTO";

export const RATING_SCALE_MIN = 0;
export const RATING_SCALE_MAX = 10;

// Create a new question object with safe defaults
export function makeNewQuestion(params: { position: number; type?: QuestionType }): QuestionDTO {
    const { position, type = QuestionType.MultipleChoice } = params;

    // IDs are stable and derived from position (q1, q2, ...)
    const questionId = `q${position + 1}`;

    if (type === QuestionType.MultipleChoice) {
        const q: MultipleChoiceDTO = {
            questionId,
            position,
            type,
            prompt: "",
            description: "",
            required: false,
            options: ["", ""],
        };
        return q;
    }

    if (type === QuestionType.CheckBox) {
        const q: CheckBoxDTO = {
            questionId,
            position,
            type,
            prompt: "",
            description: "",
            required: false,
            options: ["", ""],
            minSelect: 1,
            maxSelect: 2,
        };
        return q;
    }

    if (type === QuestionType.Rating) {
        const q: RatingDTO = {
            questionId,
            position,
            type,
            prompt: "",
            description: "",
            required: false,
            scaleMin: 1,
            scaleMax: 5,
            labelMin: "Poor",
            labelMax: "Excellent",
        };
        return q;
    }

    const q: ShortAnswerDTO = {
        questionId,
        position,
        type: QuestionType.ShortAnswer,
        prompt: "",
        description: "",
        required: false,
    };
    return q;
}

export function normalizeQuestions(questions: QuestionDTO[]): QuestionDTO[] {
    return questions.map((q, idx) => ({
        ...q,
        position: idx,
        questionId: `q${idx + 1}`,
    }));
}

export function clampInt(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function parseOptionalInt(value: string): number | undefined {
    if (value.trim() === "") return undefined;

    const n = Number(value);
    if (!Number.isFinite(n)) return undefined;

    return Math.trunc(n);
}