// http://localhost:5173/admin-dashboard/surveys/new

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Shadcn-style UI components
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
import PublishSurveyPopup from "@/components/PublishSurveyPopup";
import PopupWindow from "@/components/PopupWindow";

// Create a new question object with safe defaults
function makeNewQuestion(params: { position: number; type?: QuestionType }): QuestionDTO {
    const { position, type = QuestionType.MultipleChoice } = params;

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
    if (value.trim() === "") return undefined;

    const n = Number(value);
    if (!Number.isFinite(n)) return undefined;

    return Math.trunc(n);
}

export default function CreateSurvey() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [showPublishPopup, setShowPublishPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const [questions, setQuestions] = useState<QuestionDTO[]>(() => [
        makeNewQuestion({ position: 0, type: QuestionType.MultipleChoice }),
    ]);

    function updateQuestion(index: number, updater: (prev: QuestionDTO) => QuestionDTO) {
        setQuestions((prev) => normalizeQuestions(prev.map((q, i) => (i === index ? updater(q) : q))));
    }

    function changeQuestionType(index: number, type: QuestionType) {
        setQuestions((prev) => {
            const old = prev[index];
            const rebuilt = makeNewQuestion({ position: index, type });

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

    function publish() {
        setShowPublishPopup(true);
        console.log("Publish survey:", { title, description, questions });
    }

    function handlePublish(emails: string[]) {
        console.log("Selected emails:", emails);
        setShowPublishPopup(false);
        setShowSuccessPopup(true);
    }

    function handleGoBackToDashboard() {
        navigate("/admin-dashboard");
    }

    const surveyName = title.trim() || "Untitled Survey";

    return (
        <>
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 px-3 sm:px-4">
                <div className="flex justify-end">
                    <Button
                        type="button"
                        className="rounded-full bg-blue-600 px-10 text-white hover:bg-blue-700"
                        onClick={publish}
                    >
                        Publish
                    </Button>
                </div>

                <SurveyHeaderCard
                    title={title}
                    description={description}
                    setTitle={setTitle}
                    setDescription={setDescription}
                />

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

                <div className="flex justify-center pt-2">
                    <Button type="button" variant="outline" className="rounded-full px-10" onClick={addQuestion}>
                        Add New
                    </Button>
                </div>
            </div>

            {showPublishPopup && (
                <PublishSurveyPopup
                    surveyLink="http://localhost:5173/survey/123"
                    onBack={() => setShowPublishPopup(false)}
                    onPublish={handlePublish}
                />
            )}

            {showSuccessPopup && (
                <PopupWindow
                    text={
                        <p className="text-lg font-medium">
                            Survey &quot;{surveyName}&quot; has been successfully published!
                        </p>
                    }
                    firstButtonText="Go back to admin dashboard"
                    onFirstClick={handleGoBackToDashboard}
                />
            )}
        </>
    );
}