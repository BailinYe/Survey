import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import SurveyHeader from "./SurveyHeader";
import ResponseCard from "./ResponseCard";

import type { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";
import type { AnswerValue } from "@shared/models/dtos/types/ResponseDTO";
import type { CheckBoxDTO } from "@shared/models/dtos/types/QuestionDTO";
import { getPublicSurveyById, submitSurveyResponse } from "@/api/surveys";

export default function RespondSurvey() {
    const { surveyId } = useParams<{ surveyId: string }>();

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
        if (!survey) return false;

        const errors: Record<string, string> = {};

        for (const question of survey.questions) {
            const answer = answers[question.questionId];

            if (question.required && !answer) {
                errors[question.questionId] = "This question is required";
                continue;
            }

            if (!answer) continue;

            if (question.type === "CheckBox" || question.type === "checkBox") {
                const checkBoxQ = question as CheckBoxDTO;
                const selectedCount = (answer as { type: "CheckBox" | "checkBox"; value: string[] }).value.length;

                if (checkBoxQ.minSelect !== undefined && selectedCount < checkBoxQ.minSelect) {
                    errors[question.questionId] = `Please select at least ${checkBoxQ.minSelect} option(s)`;
                }

                if (checkBoxQ.maxSelect !== undefined && selectedCount > checkBoxQ.maxSelect) {
                    errors[question.questionId] = `Please select at most ${checkBoxQ.maxSelect} option(s)`;
                }
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!survey || !surveyId) return;

        setError("");
        setSuccessMessage("");

        if (!validateAnswers()) {
            setError("Please fix validation errors before submitting.");
            return;
        }

        setIsSubmitting(true);

        try {
            await submitSurveyResponse(surveyId, answers);
            setSuccessMessage("Your response has been submitted successfully.");
            setAnswers({});
            setValidationErrors({});
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
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <div className="rounded border border-red-400 bg-red-100 p-4 text-red-700">
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

            {error && (
                <div className="rounded border border-red-400 bg-red-100 p-4 text-red-700">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="rounded border border-green-400 bg-green-100 p-4 text-green-700">
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
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
            </div>
        </div>
    );
}