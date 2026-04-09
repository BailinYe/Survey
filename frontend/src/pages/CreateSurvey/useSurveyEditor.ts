import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { QuestionType } from "@shared/models/dtos/enums/QuestionType";
import type { QuestionDTO } from "@shared/models/dtos/types/QuestionDTO";
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";

import { createSurvey, getSurveyById, publishSurvey, updateSurvey } from "@/api/surveys";

import { makeNewQuestion, normalizeQuestions } from "./questionFactory";

type SaveResult = | { ok: true; id: string; created: boolean } | { ok: false; errorMessage: string };

/**
 * Hook for CreateSurvey page:
 * - supports /surveys/new and /surveys/:surveyId/edit
 * - loads existing survey (draft-only editable)
 * - handles save (create or update) and publish
 */
export function useSurveyEditor() {
    const navigate = useNavigate();
    const { surveyId: routeSurveyId } = useParams<{ surveyId: string }>();

    // Survey editor state
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

    // Used to disable Save on untouched new screen
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
            } finally {
                if (!cancelled) setIsLoadingSurvey(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [routeSurveyId, navigate]);

    // Question editing helpers
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

    // Save logic (single source of truth)
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

    // Publish flow
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

    function goBackToDashboard() {
        navigate("/admin-dashboard");
    }

    // Draft editability
    const isDraftEditable = (status ?? SurveyStatus.New) === SurveyStatus.New;

    return {
        // ids/status
        routeSurveyId, surveyId, status, isDraftEditable,

        // fields
        title, setTitle, description, setDescription, questions, setQuestions,

        // derived
        surveyName, isEmptyDraft,

        // ui state
        isLoadingSurvey, loadError, isSaving, saveError, saveSuccess,

        showPublishPopup, setShowPublishPopup, showSuccessPopup, setShowSuccessPopup,

        // handlers
        updateQuestion, changeQuestionType, addQuestion, deleteQuestion, addOption, updateOption, removeOption,

        saveDraft, handleSave,

        openPublish, handlePublish,

        goBackToDashboard,

        // expose setters if you need them in the page
        setSaveError, setSaveSuccess,
    };
}