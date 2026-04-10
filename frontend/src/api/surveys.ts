import { auth } from "@/firebase/firebase";
import type { QuestionDTO } from "@shared/models/dtos/types/QuestionDTO";
import type { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";
import type { AnswerValue } from "@shared/models/dtos/types/ResponseDTO";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type SaveSurveyPayload = {
    title: string;
    description: string;
    questions: QuestionDTO[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getErrorMessage(data: unknown, fallback: string): string {
    if (isRecord(data)) {
        if (typeof data.error === "string") return data.error;
        if (typeof data.message === "string") return data.message;
    }
    return fallback;
}

async function getIdTokenOrThrow(): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    return user.getIdToken();
}

async function fetchJson(path: string, init: RequestInit): Promise<unknown> {
    const res = await fetch(`${API_BASE_URL}${path}`, init);

    const text = await res.text();
    const data: unknown = text ? JSON.parse(text) : null;

    if (!res.ok) {
        throw new Error(getErrorMessage(data, `Request failed (HTTP ${res.status})`));
    }

    return data;
}

/** POST /api/surveys -> creates draft (status New) */
export async function createSurvey(payload: SaveSurveyPayload): Promise<{ id: string }> {
    const token = await getIdTokenOrThrow();

    const data = await fetchJson("/api/surveys", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!isRecord(data) || typeof data.id !== "string") {
        throw new Error("Backend did not return survey id");
    }

    return { id: data.id };
}

/** PUT /api/surveys/:id -> updates draft (only status New editable) */
export async function updateSurvey(
    surveyId: string,
    payload: Partial<SaveSurveyPayload>,
): Promise<void> {
    const token = await getIdTokenOrThrow();

    await fetchJson(`/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
}

/** GET /api/surveys/:id -> loads survey for admin owner */
export async function getSurveyById(surveyId: string): Promise<SurveyDTO> {
    const token = await getIdTokenOrThrow();

    const data = await fetchJson(`/api/surveys/${surveyId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (
        !isRecord(data) ||
        typeof data.id !== "string" ||
        typeof data.authorId !== "string" ||
        typeof data.title !== "string" ||
        typeof data.description !== "string"
    ) {
        throw new Error("Invalid survey response from backend");
    }

    return data as unknown as SurveyDTO;
}

/** GET /api/surveys/public/:id -> loads public survey for respondents */
export async function getPublicSurveyById(surveyId: string): Promise<SurveyDTO> {
    const data = await fetchJson(`/api/surveys/public/${surveyId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (
        !isRecord(data) ||
        typeof data.id !== "string" ||
        typeof data.title !== "string" ||
        typeof data.description !== "string"
    ) {
        throw new Error("Invalid survey response from backend");
    }

    return data as unknown as SurveyDTO;
}

/** POST /api/surveys/:id/publish -> sets status Active and stores emails */
export async function publishSurvey(surveyId: string, emails: string[]): Promise<void> {
    const token = await getIdTokenOrThrow();

    await fetchJson(`/api/surveys/${surveyId}/publish`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emails }),
    });
}

/** POST /api/responses -> submit respondent answers */
export async function submitSurveyResponse(
    surveyId: string,
    answers: Record<string, AnswerValue>,
): Promise<void> {
    await fetchJson("/api/responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            surveyId,
            answers,
        }),
    });
}

/** Helper used by UI routing */
export function isDraftEditable(status?: SurveyStatus): boolean {
    return (status ?? SurveyStatus.Active) === SurveyStatus.New;
}