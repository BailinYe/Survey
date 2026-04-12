import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { QuestionType } from "@shared/models/dtos/enums/QuestionType";
import type { QuestionDTO } from "@shared/models/dtos/types/QuestionDTO";
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";

import type { AdminLayoutContext } from "@/components/layout/AdminLayout";
import { createSurvey, deleteSurvey, getSurveyById, publishSurvey, updateSurvey } from "@/api/surveys";

import { makeNewQuestion, normalizeQuestions } from "./questionFactory";
import { toast } from "sonner";

type SaveResult = { ok: true; id: string; created: boolean } | { ok: false; errorMessage: string };

type ComparableSurveyState = {
    title: string;
    description: string;
    expiredAt: string;
    questions: QuestionDTO[];
};

function isExpiredAtInPast(expiredAt: string): boolean {
    if (!expiredAt.trim()) return false;

    const parsed = new Date(expiredAt);
    if (Number.isNaN(parsed.getTime())) return false;

    return parsed.getTime() <= Date.now();
}

function normalizeExpiredAtForComparison(value: string): string {
    if (!value.trim()) return "";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value.trim();

    return parsed.toISOString();
}

function buildComparableSurveyState(
    title: string,
    description: string,
    expiredAt: string,
    questions: QuestionDTO[],
): ComparableSurveyState {
    return {
        title: title.trim(),
        description: description.trim(),
        expiredAt: normalizeExpiredAtForComparison(expiredAt),
        questions: normalizeQuestions(questions),
    };
}

function stringifySurveyState(state: ComparableSurveyState): string {
    return JSON.stringify(state);
}

/**
 * Hook for CreateSurvey page:
 * - supports /surveys/new and /surveys/:surveyId/edit
 * - loads existing survey (draft-only editable)
 * - handles save (create or update) and publish
 * - detects unsaved changes before leaving the editor
 */
export function useSurveyEditor() {
    const navigate = useNavigate();

    const { refreshSurveys, setBackToDashboardHandler } =
        useOutletContext<AdminLayoutContext>();
    const { surveyId: routeSurveyId } = useParams<{ surveyId: string }>();

    const [surveyId, setSurveyId] = useState<string | null>(null);
    const [status, setStatus] = useState<SurveyStatus | undefined>(undefined);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [expiredAt, setExpiredAt] = useState("");

    const [questions, setQuestions] = useState<QuestionDTO[]>(() => [
        makeNewQuestion({ position: 0, type: QuestionType.MultipleChoice }),
    ]);

    const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);
    const [loadError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showPublishPopup, setShowPublishPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showDiscardChangesPopup, setShowDiscardChangesPopup] = useState(false);
    const [lastSavedSnapshot, setLastSavedSnapshot] = useState(() =>
        stringifySurveyState(
            buildComparableSurveyState(
                "",
                "",
                "",
                [makeNewQuestion({ position: 0, type: QuestionType.MultipleChoice })],
            ),
        ),
    );

    const surveyName = title.trim() || "Untitled Survey";

    const currentSnapshot = useMemo(
        () =>
            stringifySurveyState(
                buildComparableSurveyState(title, description, expiredAt, questions),
            ),
        [title, description, expiredAt, questions],
    );

    const hasUnsavedChanges = currentSnapshot !== lastSavedSnapshot;

    const isEmptyDraft = useMemo(() => {
        const hasAnyPrompt = questions.some((q) => q.prompt.trim().length > 0);
        return (
            title.trim() === "" &&
            description.trim() === "" &&
            expiredAt.trim() === "" &&
            !hasAnyPrompt &&
            questions.length === 1
        );
    }, [title, description, expiredAt, questions]);

    const goBackToDashboard = useCallback(() => {
        if (hasUnsavedChanges) {
            setShowDiscardChangesPopup(true);
            return;
        }

        navigate("/admin-dashboard");
    }, [hasUnsavedChanges, navigate]);

    const cancelDiscardChanges = useCallback(() => {
        setShowDiscardChangesPopup(false);
    }, []);

    const discardChangesAndLeave = useCallback(() => {
        setShowDiscardChangesPopup(false);
        navigate("/admin-dashboard");
    }, [navigate]);

    useEffect(() => {
        setBackToDashboardHandler(() => goBackToDashboard);

        return () => {
            setBackToDashboardHandler(null);
        };
    }, [setBackToDashboardHandler, goBackToDashboard]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!routeSurveyId) {
                const emptySnapshot = stringifySurveyState(
                    buildComparableSurveyState(
                        "",
                        "",
                        "",
                        [makeNewQuestion({ position: 0, type: QuestionType.MultipleChoice })],
                    ),
                );
                setLastSavedSnapshot(emptySnapshot);
                return;
            }

            setIsLoadingSurvey(true);

            try {
                const s = await getSurveyById(routeSurveyId);
                if (cancelled) return;

                if (s.status && s.status !== SurveyStatus.New) {
                    navigate(`/admin-dashboard/surveys/${routeSurveyId}/analytics`, { replace: true });
                    return;
                }

                const loadedTitle = s.title ?? "";
                const loadedDescription = s.description ?? "";
                const loadedExpiredAt = s.expiredAt
                    ? new Date(s.expiredAt).toISOString().slice(0, 16)
                    : "";
                const loadedQuestions = normalizeQuestions(Array.isArray(s.questions) ? s.questions : []);

                setSurveyId(s.id);
                setStatus(s.status);
                setTitle(loadedTitle);
                setDescription(loadedDescription);
                setExpiredAt(loadedExpiredAt);
                setQuestions(loadedQuestions);
                setLastSavedSnapshot(
                    stringifySurveyState(
                        buildComparableSurveyState(
                            loadedTitle,
                            loadedDescription,
                            loadedExpiredAt,
                            loadedQuestions,
                        ),
                    ),
                );
            } catch (e) {
                if (cancelled) return;
                const msg = e instanceof Error ? e.message : "Failed to load survey.";
                console.error(msg);
                toast.error(msg, { position: "top-center" });
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
            ]),
        );
    }

    function deleteQuestion(index: number) {
        setQuestions((prev) => normalizeQuestions(prev.filter((_, i) => i !== index)));
    }

    async function saveDraft(): Promise<SaveResult> {
        if (title.trim() === "") {
            toast.error("Title is required to save a draft.", { position: "top-center" });
            return { ok: false, errorMessage: "Title is required to save a draft." };
        }

        setIsSaving(true);

        try {
            const payload = {
                title,
                description,
                expiredAt: expiredAt.trim() === "" ? null : new Date(expiredAt).toISOString(),
                questions,
            };

            if (!surveyId) {
                const { id } = await createSurvey(payload);

                setSurveyId(id);
                setStatus(SurveyStatus.New);
                setLastSavedSnapshot(currentSnapshot);

                navigate(`/admin-dashboard/surveys/${id}/edit`, { replace: true });
                toast.success("Draft created successfully.", { position: "top-center" });
                await refreshSurveys();

                return { ok: true, id, created: true };
            }

            await updateSurvey(surveyId, payload);
            setLastSavedSnapshot(currentSnapshot);
            toast.success("Draft saved successfully.", { position: "top-center" });
            await refreshSurveys();

            return { ok: true, id: surveyId, created: false };
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to save survey.";
            toast.error("Failed to save survey.", { position: "top-center" });
            console.error(e);
            return { ok: false, errorMessage: msg };
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSave() {
        await saveDraft();
    }

    async function openPublish() {
        if (!expiredAt.trim()) {
            toast.error("Please set an expiry date and time before publishing.", { position: "top-center" });
            return;
        }

        if (isExpiredAtInPast(expiredAt)) {
            toast.error("The expiry date and time must be in the future before publishing.", { position: "top-center" });
            return;
        }

        if (questions.length < 1) {
            toast.error("Please add at least one question before publishing.", { position: "top-center" });
            return;
        }

        const hasBlankPrompt = questions.some((q) => !q.prompt || q.prompt.trim() === "");
        if (hasBlankPrompt) {
            toast.error("Each question must have a prompt before publishing.", { position: "top-center" });
            return;
        }

        const hasInvalidOptions = questions.some((q) => {
            if (q.type !== QuestionType.MultipleChoice && q.type !== QuestionType.CheckBox) {
                return false;
            }

            if (!Array.isArray(q.options) || q.options.length < 1) {
                return true;
            }

            return q.options.some((option) => option.trim() === "");
        });

        if (hasInvalidOptions) {
            toast.error("Each question must have non-empty options before publishing.", { position: "top-center" });
            return;
        }

        const result = await saveDraft();
        if (!result.ok) return;

        setShowPublishPopup(true);
    }

    async function handlePublish(emails: string[]) {
        if (!surveyId) {
            toast.error("Save the survey first before publishing.");
            return;
        }

        try {
            await publishSurvey(surveyId, emails);
            setStatus(SurveyStatus.Active);
            setShowPublishPopup(false);
            setShowSuccessPopup(true);
            await refreshSurveys();
        } catch (e) {
            toast.error("Failed to publish survey.");
            console.log(e);
        }
    }

    async function handleDeleteSurvey() {
        if (!surveyId) {
            toast.error("Save the survey first before deleting.", { position: "top-center" });
            return;
        }

        try {
            await deleteSurvey(surveyId);
            toast.success("Survey deleted successfully.", { position: "top-center" });
            await refreshSurveys();
            navigate("/admin-dashboard", { replace: true });
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to delete survey.";
            toast.error(msg, { position: "top-center" });
            console.error(e);
        }
    }

    const isDraftEditable = (status ?? SurveyStatus.New) === SurveyStatus.New;

    return {
        routeSurveyId,
        surveyId,
        status,
        isDraftEditable,

        title,
        setTitle,
        description,
        setDescription,
        expiredAt,
        setExpiredAt,
        questions,
        setQuestions,

        surveyName,
        isEmptyDraft,
        hasUnsavedChanges,

        isLoadingSurvey,
        loadError,
        isSaving,

        showPublishPopup,
        setShowPublishPopup,
        showSuccessPopup,
        setShowSuccessPopup,
        showDiscardChangesPopup,
        setShowDiscardChangesPopup,

        updateQuestion,
        changeQuestionType,
        addQuestion,
        deleteQuestion,
        addOption,
        updateOption,
        removeOption,

        saveDraft,
        handleSave,
        handleDeleteSurvey,
        openPublish,
        handlePublish,

        goBackToDashboard,
        cancelDiscardChanges,
        discardChangesAndLeave,
    };
}