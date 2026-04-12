import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import type { AdminLayoutContext } from "@/components/layout/AdminLayout";

import { parseDate } from "@/utils/date";

import Card from "@/components/common/Card";
import MultipleChoiceResults from "@/components/survey-results/MultipleChoiceResults";
import CheckBoxResults from "@/components/survey-results/CheckBoxResults";
import RatingResults from "@/components/survey-results/RatingResults";
import ShortAnswerResults from "@/components/survey-results/ShortAnswerResults";
import SurveyInfoCard from "@/components/survey-results/SurveyInfoCard";

import { toast } from "sonner";

import { AnswerValue, QuestionDTO, ResponseDTO, SurveyDTO } from "@shared/models/dtos";
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";
import { QuestionType } from "@shared/models/dtos/enums/QuestionType";

import {
    MessageSquareText,
    MessageCircle,
    CalendarMinus2,
    Link2,
    Lock,
    Trash2,
    LockOpen,
    CalendarClock,
} from "lucide-react";
import { auth } from "@/firebase/firebase";
import PopupWindow from "@/components/PopupWindow";

function formatExpiredAt(expiredAt: SurveyDTO["expiredAt"]): string {
    if (!expiredAt) {
        return "Not set";
    }

    const parsed = new Date(expiredAt);
    if (Number.isNaN(parsed.getTime())) {
        return "Invalid date";
    }

    return parsed.toLocaleString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatExpiredTime(expiredAt: SurveyDTO["expiredAt"]): string {
    if (!expiredAt) {
        return "";
    }

    const parsed = new Date(expiredAt);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    return parsed.toLocaleString("en-CA", {
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function SurveyAnalytics() {
    const { refreshSurveys } = useOutletContext<AdminLayoutContext>();

    const navigate = useNavigate();

    const { surveyId } = useParams<{ surveyId: string }>();

    const [survey, setSurvey] = useState<SurveyDTO | null>(null);
    const [responses, setResponses] = useState<ResponseDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [showDeletePopup, setShowDeletePopup] = useState(false);

    const questions: QuestionDTO[] = useMemo(() => {
        if (!survey?.questions) return [];
        return [...survey.questions].sort((a, b) => a.position - b.position);
    }, [survey]);

    useEffect(() => {
        async function fetchSurveyAnalytics() {
            if (!surveyId) {
                setError("Survey ID is missing.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError("");

                const user = auth.currentUser;
                if (!user) {
                    throw new Error("User is not authenticated.");
                }

                const token = await user.getIdToken();
                const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

                const [surveyRes, responsesRes] = await Promise.all([
                    fetch(`${baseUrl}/api/surveys/${surveyId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    fetch(`${baseUrl}/api/responses/survey/${surveyId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

                if (!surveyRes.ok) {
                    const errorData = await surveyRes.json().catch(() => null);
                    throw new Error(errorData?.error || "Failed to load survey.");
                }

                if (!responsesRes.ok) {
                    const errorData = await responsesRes.json().catch(() => null);
                    throw new Error(errorData?.error || "Failed to load survey responses.");
                }

                const surveyData: SurveyDTO = await surveyRes.json();
                const responsesData: ResponseDTO[] = await responsesRes.json();

                setSurvey(surveyData);
                setResponses(responsesData);
            } catch (err) {
                console.error("Error loading survey analytics:", err);
                setError(err instanceof Error ? err.message : "Unable to load survey analytics.");
            } finally {
                setIsLoading(false);
            }
        }

        void fetchSurveyAnalytics();
    }, [surveyId]);

    if (isLoading) {
        return (
            <div className="flex flex-col w-full px-6 py-6 gap-6 lg:px-10">
                <h1 className="text-3xl font-semibold tracking-tight">Survey Analytics</h1>
                <p className="text-muted-foreground">Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col w-full px-6 py-6 gap-6 lg:px-10">
                <h1 className="text-3xl font-semibold tracking-tight">Survey Analytics</h1>
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="flex flex-col w-full px-6 py-6 gap-6 lg:px-10">
                <h1 className="text-3xl font-semibold tracking-tight">Survey Analytics</h1>
                <p className="text-muted-foreground">Survey not found.</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col w-full px-6 py-6 gap-6 lg:px-10">
                <h1 className="text-3xl font-semibold tracking-tight">Survey Analytics</h1>
                <p className="text-muted-foreground">No questions found for this survey.</p>
            </div>
        );
    }

    async function handleCopyLink() {
        if (!surveyId) return;

        const surveyLink = `${globalThis.location.origin}/survey/${surveyId}`;

        try {
            await navigator.clipboard.writeText(surveyLink);
            toast.success("Survey link copied to clipboard", { position: "top-center" });
        } catch (copyError) {
            console.error("Failed to copy survey link:", copyError);
            toast.error("Failed to copy survey link.", { position: "top-center" });
        }
    }

    async function handleCloseSurvey() {
        if (!surveyId) return;

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User is not authenticated.");
            }

            const token = await user.getIdToken();
            const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

            const res = await fetch(`${baseUrl}/api/surveys/${surveyId}/close`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.error || "Failed to close survey.");
            }

            setSurvey((prev) =>
                prev
                    ? {
                        ...prev,
                        status: SurveyStatus.Closed,
                    }
                    : prev,
            );
            toast.success("Survey closed successfully.", { position: "top-center" });
            await refreshSurveys();
        } catch (closeError) {
            console.error("Error closing survey:", closeError);
            toast.error(closeError instanceof Error ? closeError.message : "Failed to close survey.", {
                position: "top-center",
            });
        }
    }

    async function handleOpenSurvey() {
        if (!surveyId) return;

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User is not authenticated.");
            }

            const token = await user.getIdToken();
            const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

            const res = await fetch(`${baseUrl}/api/surveys/${surveyId}/open`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.error || "Failed to open survey.");
            }

            setSurvey((prev) =>
                prev
                    ? {
                        ...prev,
                        status: SurveyStatus.Active,
                    }
                    : prev,
            );

            toast.success("Survey opened successfully.", { position: "top-center" });
            await refreshSurveys();
        } catch (openError) {
            console.error("Error opening survey:", openError);
            toast.error(openError instanceof Error ? openError.message : "Failed to open survey.", {
                position: "top-center",
            });
        }
    }

    async function confirmDeleteSurvey() {
        if (!surveyId) return;

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User is not authenticated.");
            }

            const token = await user.getIdToken();
            const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

            const res = await fetch(`${baseUrl}/api/surveys/${surveyId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.error || "Failed to delete survey.");
            }

            setShowDeletePopup(false);
            navigate("/admin-dashboard");
            toast.warning("Survey deleted successfully.", { position: "top-center" });
            await refreshSurveys();
        } catch (deleteError) {
            console.error("Error deleting survey:", deleteError);
            setShowDeletePopup(false);
            toast.error(deleteError instanceof Error ? deleteError.message : "Failed to delete survey.", {
                position: "top-center",
            });
        }
    }

    function cancelDeleteSurvey() {
        setShowDeletePopup(false);
    }

    async function handleDeleteSurvey() {
        if (!surveyId) return;
        setShowDeletePopup(true);
    }

    const expiryValue = (
        <div className="leading-tight">
            <div>{formatExpiredAt(survey.expiredAt)}</div>
            <div>{formatExpiredTime(survey.expiredAt)}</div>
        </div>
    );

    return (
        <div className="flex w-full flex-col gap-6 px-6 py-6 lg:flex-1 lg:border-l lg:border-border lg:px-10">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-semibold tracking-tight">{survey.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{survey.description}</p>
            </div>

            <div className="flex flex-col flex-wrap justify-start gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={handleCopyLink}
                    className="analytics-action-btn analytics-action-neutral"
                >
                    <Link2 className="h-4 w-4" />
                    Copy Responder Link
                </button>
                {survey.status === "Active" ? (
                    <button
                        type="button"
                        onClick={handleCloseSurvey}
                        className="analytics-action-btn analytics-action-open"
                    >
                        <LockOpen className="h-4 w-4" />
                        Survey Open
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleOpenSurvey}
                        className="analytics-action-btn analytics-action-closed"
                    >
                        <Lock className="h-4 w-4" />
                        Survey Closed
                    </button>
                )}

                <button
                    type="button"
                    onClick={handleDeleteSurvey}
                    className="analytics-action-btn analytics-action-danger"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete Survey
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <SurveyInfoCard
                    title="Responses"
                    value={responses.length}
                    icon={MessageCircle}
                    iconClassName="analytics-icon-violet"
                    iconContainerClassName="analytics-icon-violet"
                />

                <SurveyInfoCard
                    title="Questions"
                    value={questions.length}
                    icon={MessageSquareText}
                    iconClassName="text-blue-600 dark:text-blue-300"
                    iconContainerClassName="bg-blue-100 dark:bg-blue-950/50"
                />

                <SurveyInfoCard
                    title="Last Edited"
                    value={parseDate(survey.updatedAt)}
                    icon={CalendarMinus2}
                    iconClassName="text-orange-600 dark:text-orange-300"
                    iconContainerClassName="bg-orange-100 dark:bg-orange-950/50"
                />

                <SurveyInfoCard
                    title="Expiry Date & Time"
                    value={expiryValue}
                    icon={CalendarClock}
                    iconClassName="text-emerald-600 dark:text-emerald-300"
                    iconContainerClassName="bg-emerald-100 dark:bg-emerald-950/50"
                />
            </div>

            {responses.length === 0 ? (
                <Card className="p-6">
                    <p className="text-muted-foreground">
                        No responses submitted yet for this survey.
                    </p>
                </Card>
            ) : (
                <div className="w-full space-y-6">
                    {questions.map((question) => {
                        const answersForQuestion = responses
                            .map((response) => response.answers[question.questionId])
                            .filter((answer): answer is AnswerValue => answer !== undefined);

                        const multipleChoiceAnswers = answersForQuestion.filter(
                            (answer): answer is Extract<AnswerValue, { type: QuestionType.MultipleChoice }> =>
                                answer.type === QuestionType.MultipleChoice,
                        );

                        const checkBoxAnswers = answersForQuestion.filter(
                            (answer): answer is Extract<AnswerValue, { type: QuestionType.CheckBox }> =>
                                answer.type === QuestionType.CheckBox,
                        );

                        const shortAnswerAnswers = answersForQuestion.filter(
                            (answer): answer is Extract<AnswerValue, { type: QuestionType.ShortAnswer }> =>
                                answer.type === QuestionType.ShortAnswer,
                        );

                        const ratingAnswers = answersForQuestion.filter(
                            (answer): answer is Extract<AnswerValue, { type: QuestionType.Rating }> =>
                                answer.type === QuestionType.Rating,
                        );

                        return (
                            <Card key={question.questionId} className="w-full !max-w-none max-h-fit p-6">
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold">{question.prompt}</h2>
                                    {question.description && (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {question.description}
                                        </p>
                                    )}
                                </div>

                                {question.type === QuestionType.MultipleChoice && (
                                    <MultipleChoiceResults
                                        question={question}
                                        answers={multipleChoiceAnswers}
                                    />
                                )}

                                {question.type === QuestionType.CheckBox && (
                                    <CheckBoxResults
                                        question={question}
                                        answers={checkBoxAnswers}
                                    />
                                )}

                                {question.type === QuestionType.ShortAnswer && (
                                    <ShortAnswerResults answers={shortAnswerAnswers} />
                                )}

                                {question.type === QuestionType.Rating && (
                                    <RatingResults
                                        question={question}
                                        answers={ratingAnswers}
                                    />
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            {showDeletePopup && (
                <PopupWindow
                    text={
                        <>
                            <p className="text-lg font-semibold">Delete survey?</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                This action cannot be undone.
                            </p>
                        </>
                    }
                    firstButtonText="Delete"
                    onFirstClick={confirmDeleteSurvey}
                    secondButtonText="Cancel"
                    onSecondClick={cancelDeleteSurvey}
                />
            )}
        </div>
    );
}