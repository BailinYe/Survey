import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams  } from "react-router-dom";

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
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";

// Page components (extracted)
import SurveyHeaderCard from "./SurveyHeaderCard";
import QuestionCard from "./QuestionCard";
import PublishSurveyPopup from "@/components/PublishSurveyPopup";
import PopupWindow from "@/components/PopupWindow";

// API
import { createSurvey, getSurveyById, publishSurvey, updateSurvey } from "@/api/surveys";

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
    }));
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
    const { surveyId: routeSurveyId } = useParams<{ surveyId: string }>();

    // Survey state
    const [surveyId, setSurveyId] = useState<string | null>(null);
    const [status, setStatus] = useState<SurveyStatus | undefined>(undefined);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [questions, setQuestions] = useState<QuestionDTO[]>(() => [
        makeNewQuestion({ position: 0, type: QuestionType.MultipleChoice }),
    ]);

    // UI state
    const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");

    const [showPublishPopup, setShowPublishPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const surveyName = title.trim() || "Untitled Survey";

    const isEmptyDraft = useMemo(() => {
        const hasAnyPrompt = questions.some((q) => q.prompt.trim().length > 0);
        return title.trim() === "" && description.trim() === "" && !hasAnyPrompt && questions.length === 1;
    }, [title, description, questions]);

    // Load existing survey when on /:surveyId/edit
    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!routeSurveyId) return;

            setIsLoadingSurvey(true);
            setLoadError("");
            setSaveError("");
            // setSaveSuccess("");

            try {
                const s = await getSurveyById(routeSurveyId);
                if (cancelled) return;

                // Only drafts are editable; otherwise go to analytics
                if (s.status && s.status !== SurveyStatus.New) {
                    navigate(`/admin-dashboard/surveys/${routeSurveyId}/analytics`, { replace: true });
                    return;
                }

                setSurveyId(s.id);
                setStatus(s.status);

                setTitle(s.title ?? "");
                setDescription(s.description ?? "");
                setQuestions(normalizeQuestions(Array.isArray(s.questions) ? s.questions : []));
            } catch (e) {
                if (cancelled) return;
                const msg = e instanceof Error ? e.message : "Failed to load survey.";
                setLoadError(msg);

                // Do NOT force redirect here; ProtectedRoute already handles auth.
                // This avoids flaky redirects on refresh.
            } finally {
                if (!cancelled) setIsLoadingSurvey(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [routeSurveyId, navigate]);

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

    type SaveResult =
        | { ok: true; id: string; created: boolean }
        | { ok: false; errorMessage: string };

    async function saveDraft(): Promise<SaveResult> {
        setSaveError("");
        setSaveSuccess("");

        if (title.trim() === "") {
            const msg = "Title is required to save a draft.";
            setSaveError(msg);
            return { ok: false, errorMessage: msg };
        }

        setIsSaving(true);
        try {
            const payload = { title, description, questions };

            // CREATE (first save)
            if (!surveyId) {
                const { id } = await createSurvey(payload);
                setSurveyId(id);
                setStatus(SurveyStatus.New);

                // ensure refresh stays on edit route
                navigate(`/admin-dashboard/surveys/${id}/edit`, { replace: true });
                setSaveSuccess("Draft created and saved.");
                return { ok: true, id, created: true };
            }

            // UPDATE (subsequent saves)
            await updateSurvey(surveyId, payload);
            setSaveSuccess("Draft saved.");
            return { ok: true, id: surveyId, created: false };
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to save survey.";
            setSaveError(msg);
            return { ok: false, errorMessage: msg };
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSave() {
        await saveDraft();
    }

    async function openPublish() {
        setSaveError("");
        setSaveSuccess("");

        if (questions.length < 1) {
            setSaveError("Add at least one question before publishing.");
            return;
        }

        const hasBlankPrompt = questions.some((q) => !q.prompt || q.prompt.trim() === "");
        if (hasBlankPrompt) {
            setSaveError("Each question must have a prompt before publishing.");
            return;
        }

        const result = await saveDraft();
        if (!result.ok) return;

        setShowPublishPopup(true);
    }

    async function handlePublish(emails: string[]) {
        setShowPublishPopup(false);
        setSaveError("");
        setSaveSuccess("");

        if (!surveyId) {
            setSaveError("Save the survey first before publishing.");
            return;
        }

        try {
            await publishSurvey(surveyId, emails);
            setStatus(SurveyStatus.Active);
            setShowSuccessPopup(true);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to publish survey.";
            setSaveError(msg);
        }
    }

    function handleGoBackToDashboard() {
        navigate("/admin-dashboard");
    }

    return (
        <>
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 px-3 sm:px-4">
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full px-10"
                        onClick={handleSave}
                        disabled={isSaving || isEmptyDraft || isLoadingSurvey || (status && status !== SurveyStatus.New)}
                        title={status && status !== SurveyStatus.New ? "Only drafts can be edited" : undefined}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                        type="button"
                        className="rounded-full bg-blue-600 px-10 text-white hover:bg-blue-700"
                        onClick={openPublish}
                        disabled={!surveyId || isSaving || isLoadingSurvey}
                        title={!surveyId ? "Save first to create a draft" : undefined}
                    >
                        Publish
                    </Button>
                </div>

                {/* Load/save feedback */}
                {isLoadingSurvey && <p className="text-sm text-muted-foreground">Loading survey…</p>}
                {loadError && <p className="text-sm font-medium text-red-600">{loadError}</p>}
                {saveError && <p className="text-sm font-medium text-red-600">{saveError}</p>}
                {saveSuccess && <p className="text-sm font-medium text-green-700">{saveSuccess}</p>}

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
                    surveyLink={surveyId ? `http://localhost:5173/survey/${surveyId}` : "http://localhost:5173/survey/"}
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