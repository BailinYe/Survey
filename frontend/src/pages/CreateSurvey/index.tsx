// http://localhost:5173/admin-dashboard/surveys/new

import { useState } from "react";

// shadcn-style UI components
import { Button } from "@/components/ui/button";

// Shared DTO enums/types
import { QuestionType } from "@shared/models/dtos/enums/QuestionType";
import type {
    QuestionDTO,
    MultipleChoiceDTO,
    CheckBoxDTO,
    ShortAnswerDTO,
    RatingDTO,
} from "@shared/models/dtos/types/QuestionDTO";

// Page components (extracted)
import SurveyHeaderCard from "./SurveyHeaderCard";
import QuestionCard from "./QuestionCard";

// Create a new question object with safe defaults
function makeNewQuestion(params: { position: number; type?: QuestionType }): QuestionDTO {
    const { position, type = QuestionType.MultipleChoice } = params;

    // IDs like q1, q2, q3...
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

    // Short answer
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

/**
 * Keep questionId + position consistent after deletes/insertions.
 * This prevents weird states like duplicate q1/q2 or incorrect ordering.
 */
function normalizeQuestions(questions: QuestionDTO[]): QuestionDTO[] {
    return questions.map((q, idx) => ({
        ...q,
        position: idx,
        questionId: `q${idx + 1}`,
    })) as QuestionDTO[];
}

const RATING_SCALE_MIN = 0;
const RATING_SCALE_MAX = 10;

function clampInt(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, Math.trunc(n)));
}

function parseOptionalInt(value: string): number | undefined {
    // Allow empty string while the user is typing
    if (value.trim() === "") return undefined;

    const n = Number(value);
    if (!Number.isFinite(n)) return undefined;

    return Math.trunc(n);
}

export default function CreateSurvey() {
    // Local state for the survey header fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // The question list for the builder
    const [questions, setQuestions] = useState<QuestionDTO[]>(() => [
        makeNewQuestion({ position: 0, type: QuestionType.MultipleChoice }),
    ]);

    // Update a single question by index (immutable update).
    function updateQuestion(index: number, updater: (prev: QuestionDTO) => QuestionDTO) {
        setQuestions((prev) => normalizeQuestions(prev.map((q, i) => (i === index ? updater(q) : q))));
    }

    /**
     * Change question type by rebuilding with defaults for that type,
     * while preserving common fields (prompt/description/required).
     */
    function changeQuestionType(index: number, type: QuestionType) {
        setQuestions((prev) => {
            const old = prev[index];
            const rebuilt = makeNewQuestion({ position: index, type });

            // Preserve user-entered fields so they don’t lose text when switching type
            const merged: QuestionDTO = {
                ...rebuilt,
                prompt: old.prompt,
            } as QuestionDTO;

            const next = [...prev];
            next[index] = merged;

            return normalizeQuestions(next);
        });
    }

    function addQuestion() {
        setQuestions((prev) =>
            normalizeQuestions([
                ...prev,
                makeNewQuestion({ position: prev.length, type: QuestionType.MultipleChoice }),
            ])
        );
    }

    function deleteQuestion(index: number) {
        setQuestions((prev) => normalizeQuestions(prev.filter((_, i) => i !== index)));
    }

    /**
     * Option helpers (for MultipleChoice / CheckBox).
     */
    function addOption(index: number) {
        updateQuestion(index, (q) => {
            if (q.type !== QuestionType.MultipleChoice && q.type !== QuestionType.CheckBox) return q;

            return {
                ...q,
                options: [...q.options, ""],
            } as QuestionDTO;
        });
    }

    function updateOption(index: number, optionIndex: number, value: string) {
        updateQuestion(index, (q) => {
            if (q.type !== QuestionType.MultipleChoice && q.type !== QuestionType.CheckBox) return q;

            const options = q.options.map((opt, i) => (i === optionIndex ? value : opt));
            return { ...q, options } as QuestionDTO;
        });
    }

    function removeOption(index: number, optionIndex: number) {
        updateQuestion(index, (q) => {
            if (q.type !== QuestionType.MultipleChoice && q.type !== QuestionType.CheckBox) return q;

            const options = q.options.filter((_, i) => i !== optionIndex);
            return { ...q, options } as QuestionDTO;
        });
    }

    // TODO: wire this to API + popup window when ready
    function publish() {
        // no-op for now
        console.log("Publish survey:", { title, description, questions });
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-6 px-3 sm:px-4">
            {/* Publish survey button (outside header card, aligned right) */}
            <div className="flex justify-end">
                <Button type="button" variant="outline" className="rounded-full px-10" onClick={publish}>
                    Publish
                </Button>
            </div>

            {/* Header card */}
            <SurveyHeaderCard
                title={title}
                description={description}
                setTitle={setTitle}
                setDescription={setDescription}
            />

            {/* Question Cards List */}
            <div className="space-y-4">
                {questions.map((q, index) => (
                    <QuestionCard
                        key={q.questionId}
                        q={q}
                        index={index}
                        changeQuestionType={changeQuestionType}
                        deleteQuestion={deleteQuestion}
                        updateQuestion={updateQuestion}
                        addOption={addOption}
                        updateOption={updateOption}
                        removeOption={removeOption}
                        RATING_SCALE_MIN={RATING_SCALE_MIN}
                        RATING_SCALE_MAX={RATING_SCALE_MAX}
                        parseOptionalInt={parseOptionalInt}
                        clampInt={clampInt}
                    />
                ))}
            </div>

            {/* Add New Question button */}
            <div className="flex justify-center pt-2">
                <Button type="button" variant="outline" className="rounded-full px-10" onClick={addQuestion}>
                    Add New
                </Button>
            </div>
        </div>
    );
}