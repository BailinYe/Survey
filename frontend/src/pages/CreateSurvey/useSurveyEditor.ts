import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { QuestionType } from "@shared/models/dtos/enums/QuestionType";
import type { QuestionDTO } from "@shared/models/dtos/types/QuestionDTO";
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";

import { useOutletContext } from "react-router-dom";
import type { AdminLayoutContext } from "@/components/layout/AdminLayout";

import { createSurvey, deleteSurvey, getSurveyById, publishSurvey, updateSurvey } from "@/api/surveys";

import { makeNewQuestion, normalizeQuestions } from "./questionFactory";
import {toast} from "sonner";

type SaveResult = { ok: true; id: string; created: boolean } | { ok: false; errorMessage: string };

/**
 * Hook for CreateSurvey page:
 * - supports /surveys/new and /surveys/:surveyId/edit
 * - loads existing survey (draft-only editable)
 * - handles save (create or update) and publish
 */
export function useSurveyEditor() {

    const navigate = useNavigate();

    const { refreshSurveys } = useOutletContext<AdminLayoutContext>();

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
    const [loadError] = useState("");

    const [isSaving, setIsSaving] = useState(false);

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
                console.error(msg);
                toast.error(msg, {position: "top-center"});
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

        if (title.trim() === "") {
            toast.error("Title is required to save a draft.", { position: "top-center" })
            const msg = "Title is required to save a draft.";
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
                toast.success("Draft created successfully.", { position: "top-center" })
                await refreshSurveys();
                return { ok: true, id, created: true };
            }

            // UPDATE (subsequent saves)
            await updateSurvey(surveyId, payload);
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

    // Publish flow
    async function openPublish() {

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

    function goBackToDashboard() {
        navigate("/admin-dashboard");
    }

    // Draft editability
    const isDraftEditable = (status ?? SurveyStatus.New) === SurveyStatus.New;

    return {
        // ids/status
        routeSurveyId,
        surveyId,
        status,
        isDraftEditable,

        // fields
        title,
        setTitle,
        description,
        setDescription,
        questions,
        setQuestions,

        // derived
        surveyName,
        isEmptyDraft,

        // ui state
        isLoadingSurvey,
        loadError,
        isSaving,

        showPublishPopup,
        setShowPublishPopup,
        showSuccessPopup,
        setShowSuccessPopup,

        // handlers
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
    };
}