import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import SurveyHeader from "./SurveyHeader";
import ResponseCard from "./ResponseCard";

import type { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";
import type { AnswerValue } from "@shared/models/dtos/types/ResponseDTO";
import { getPublicSurveyById, submitSurveyResponse } from "@/api/surveys";

function isSurveyExpired(expiredAt: SurveyDTO["expiredAt"]): boolean {
    if (!expiredAt) return false;

    const parsed = new Date(expiredAt);
    if (Number.isNaN(parsed.getTime())) return false;

    return parsed.getTime() <= Date.now();
}

function formatExpiredAt(expiredAt: SurveyDTO["expiredAt"]): string {
    if (!expiredAt) return "";

    const parsed = new Date(expiredAt);
    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getMultipleChoiceError(question: SurveyDTO["questions"][number], answer: AnswerValue): string {
    if (
        question.type === "multipleChoice" &&
        "value" in answer &&
        typeof answer.value === "string" &&
        answer.value.trim() === ""
    ) {
        return "Please select an option";
    }

    return "";
}

function getShortAnswerError(question: SurveyDTO["questions"][number], answer: AnswerValue): string {
    if (
        question.type === "shortAnswer" &&
        "value" in answer &&
        typeof answer.value === "string" &&
        answer.value.trim() === ""
    ) {
        return "This question is required";
    }

    return "";
}

function getCheckBoxError(question: SurveyDTO["questions"][number], answer: AnswerValue): string {
    if (question.type !== "checkBox") {
        return "";
    }

    const selectedValues = "value" in answer && Array.isArray(answer.value) ? answer.value : [];
    const selectedCount = selectedValues.length;

    if (question.required && selectedCount === 0) {
        return "Please select at least one option";
    }

    if (question.minSelect !== undefined && selectedCount < question.minSelect) {
        return `Please select at least ${question.minSelect} option(s)`;
    }

    if (question.maxSelect !== undefined && selectedCount > question.maxSelect) {
        return `Please select at most ${question.maxSelect} option(s)`;
    }

    return "";
}

function getRatingError(question: SurveyDTO["questions"][number], answer: AnswerValue): string {
    if (
        question.type === "rating" &&
        "value" in answer &&
        (answer.value === null || answer.value === undefined || answer.value === 0) &&
        question.required
    ) {
        return "Please select a rating";
    }

    return "";
}

function getQuestionValidationError(
    question: SurveyDTO["questions"][number],
    answer: AnswerValue | undefined,
): string {
    if (!answer) {
        return question.required ? "This question is required" : "";
    }

    return (
        getMultipleChoiceError(question, answer) ||
        getShortAnswerError(question, answer) ||
        getCheckBoxError(question, answer) ||
        getRatingError(question, answer)
    );
}

function validateSurveyAnswers(
    survey: SurveyDTO | null,
    answers: Record<string, AnswerValue>,
): Record<string, string> {
    if (!survey) return {};

    return survey.questions.reduce<Record<string, string>>((errors, question) => {
        const errorMessage = getQuestionValidationError(question, answers[question.questionId]);

        if (errorMessage) {
            errors[question.questionId] = errorMessage;
        }

        return errors;
    }, {});
}

export default function RespondSurvey() {
    const { surveyId } = useParams<{ surveyId: string }>();
    const navigate = useNavigate();

    const [survey, setSurvey] = useState<SurveyDTO | null>(null);
    const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        let cancelled = false;

        async function loadSurvey() {
            if (!surveyId) {
                setError("Survey not found.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError("");
            setSuccessMessage("");

            try {
                const data = await getPublicSurveyById(surveyId);
                if (cancelled) return;
                setSurvey(data);
            } catch (e) {
                if (cancelled) return;
                const msg = e instanceof Error ? e.message : "Failed to load survey.";
                setError(msg);
                setSurvey(null);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        void loadSurvey();

        return () => {
            cancelled = true;
        };
    }, [surveyId]);

    const surveyUnavailableMessage = useMemo(() => {
        if (!survey) return "";

        if (survey.status === "Closed") {
            return "This survey is closed and no longer accepts responses.";
        }

        if (isSurveyExpired(survey.expiredAt)) {
            const formattedExpiry = formatExpiredAt(survey.expiredAt);
            return formattedExpiry
                ? `This survey expired on ${formattedExpiry}.`
                : "This survey has expired and no longer accepts responses.";
        }

        return "";
    }, [survey]);

    const handleAnswerChange = (questionId: string, answer: AnswerValue) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));

        if (validationErrors[questionId]) {
            setValidationErrors((prev) => {
                const next = { ...prev };
                delete next[questionId];
                return next;
            });
        }
    };

    const validateAnswers = (): boolean => {
        const errors = validateSurveyAnswers(survey, answers);
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!survey || !surveyId) return;

        if (surveyUnavailableMessage) {
            setError(surveyUnavailableMessage);
            return;
        }

        setError("");
        setSuccessMessage("");

        if (!validateAnswers()) {
            setError("Please fix validation errors before submitting.");
            return;
        }

        setIsSubmitting(true);

        try {
            await submitSurveyResponse(surveyId, answers);
            setAnswers({});
            setValidationErrors({});
            navigate(`/survey-submitted/${surveyId}`, { replace: true });
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to submit survey response.";
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading survey...</p>
            </div>
        );
    }

    if (error && !survey) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
                <div className="rounded-xl border border-red-400/50 bg-red-100 px-4 py-3 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                    {error}
                </div>
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Survey not found</p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-6 px-3 sm:px-4">
            <SurveyHeader survey={survey} />

            {surveyUnavailableMessage && (
                <div className="rounded-xl border border-amber-400/50 bg-amber-100 px-4 py-3 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                    {surveyUnavailableMessage}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-400/50 bg-red-100 px-4 py-3 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="rounded-xl border border-green-400/50 bg-green-100 px-4 py-3 text-green-700 dark:bg-green-950/40 dark:text-green-300">
                    {successMessage}
                </div>
            )}

            <div className="space-y-4">
                {survey.questions.map((question, index) => (
                    <ResponseCard
                        key={question.questionId}
                        question={question}
                        index={index}
                        answer={answers[question.questionId]}
                        onAnswerChange={handleAnswerChange}
                        validationError={validationErrors[question.questionId]}
                    />
                ))}
            </div>

            <div className="flex justify-center pt-4">
                <Button
                    type="button"
                    variant="default"
                    className="rounded-full px-10"
                    onClick={handleSubmit}
                    disabled={isSubmitting || Boolean(surveyUnavailableMessage)}
                >
                    {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
            </div>
        </div>
    );
}