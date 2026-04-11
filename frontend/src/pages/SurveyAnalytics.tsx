import { useEffect, useMemo, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";

import { parseDate } from "@/utils/date";

import Card from "@/components/common/Card";
import MultipleChoiceResults from "@/components/survey-results/MultipleChoiceResults";
import CheckBoxResults from "@/components/survey-results/CheckBoxResults";
import RatingResults from "@/components/survey-results/RatingResults";
import ShortAnswerResults from "@/components/survey-results/ShortAnswerResults";
import SurveyInfoCard from "@/components/survey-results/SurveyInfoCard";

import { toast } from "sonner"

import { AnswerValue, QuestionDTO, ResponseDTO, SurveyDTO } from "@shared/models/dtos";
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";
import { QuestionType } from "@shared/models/dtos/enums/QuestionType";

import { MessageSquareText, MessageCircle, CalendarMinus2, Link2, Lock, Trash2, LockOpen } from "lucide-react";
import { auth } from "@/firebase/firebase";
import PopupWindow from "@/components/PopupWindow";

export default function SurveyAnalytics() {

    const navigate = useNavigate();

    // Retrieves SurveyId
    const { surveyId } = useParams<{ surveyId: string }>();

    // State Data
    const [survey, setSurvey] = useState<SurveyDTO | null>(null);
    const [responses, setResponses] = useState<ResponseDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [showDeletePopup, setShowDeletePopup] = useState(false);

    // Retrieves questions from Survey in Ascending Order
    const questions: QuestionDTO[] = useMemo(() => {
        if (!survey?.questions) return [];
        return [...survey.questions].sort((a, b) => a.position - b.position);
    }, [survey]);

    // Fetches Surveys from Backend using SurveyId
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
        fetchSurveyAnalytics();
    }, [surveyId]);

    // Renders view when loading
    if (isLoading) {
        return (
            <div className="flex flex-col w-full px-6 lg:px-10 py-6 gap-6">
                <h1 className="text-3xl font-semibold tracking-tight">Survey Analytics</h1>
                <p className="text-muted-foreground">Loading analytics...</p>
            </div>
        );
    }

    // Renders view when an error is encountered
    if (error) {
        return (
            <div className="flex flex-col w-full px-6 lg:px-10 py-6 gap-6">
                <h1 className="text-3xl font-semibold tracking-tight">Survey Analytics</h1>
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    // Renders view when the survey is not found
    if (!survey) {
        return (
            <div className="flex flex-col w-full px-6 lg:px-10 py-6 gap-6">
                <h1 className="text-3xl font-semibold tracking-tight">Survey Analytics</h1>
                <p className="text-muted-foreground">Survey not found.</p>
            </div>
        );
    }

    // Renders view when the Survey has no questions
    if (questions.length === 0) {
        return (
            <div className="flex flex-col w-full px-6 lg:px-10 py-6 gap-6">
                <h1 className="text-3xl font-semibold tracking-tight">Survey Analytics</h1>
                <p className="text-muted-foreground">No questions found for this survey.</p>
            </div>
        );
    }

    // Get Survey Link Helper
    async function handleCopyLink() {
        if (!surveyId) return;

        const surveyLink = `${window.location.origin}/survey/${surveyId}`;

        try {
            await navigator.clipboard.writeText(surveyLink);
            toast.success("Survey link copied to clipboard", { position: "top-center" });
        } catch (error) {
            console.error("Failed to copy survey link:", error);
            toast.error("Failed to copy survey link.");
        }
    }

    // Set Status to Close Helper
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
        } catch (error) {
            console.error("Error closing survey:", error);
            toast.error(error instanceof Error ? error.message : "Failed to close survey.");
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
        } catch (error) {
            console.error("Error opening survey:", error);
            toast.error(error instanceof Error ? error.message : "Failed to open survey.");
        }
    }

    // Delete Survey Helpers
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
        } catch (error) {
            console.error("Error deleting survey:", error);
            setShowDeletePopup(false);
            toast.error(error instanceof Error ? error.message : "Failed to delete survey.");
        }
    }

    function cancelDeleteSurvey() {
        setShowDeletePopup(false);
    }

    async function handleDeleteSurvey() {
        if (!surveyId) return;
        setShowDeletePopup(true);
    }

    return (
        <div className="flex flex-col w-full lg:flex-1 px-6 lg:px-10 py-6 gap-6 lg:border-l-2 lg:border-gray-200">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-semibold tracking-tight">{survey.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>
            </div>

            <div className="flex  flex-col flex-wrap sm:flex-row gap-3 justify-start">
                <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    <Link2 className="h-4 w-4" />
                    Copy Responder Link
                </button>
                {survey.status === "Active"?
                    <button
                        type="button"
                        onClick={handleCloseSurvey}
                        className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <LockOpen className="h-4 w-4" />
                        Survey Open
                    </button>
                    :
                    <button
                        type="button"
                        onClick={handleOpenSurvey}
                        className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Lock className="h-4 w-4" />
                        Survey Closed
                    </button>
                }

                <button
                    type="button"
                    onClick={handleDeleteSurvey}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete Survey
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SurveyInfoCard
                    title="Responses"
                    value={responses.length}
                    icon={MessageCircle}
                    iconClassName="text-violet-600"
                    iconContainerClassName="bg-violet-100"
                />

                <SurveyInfoCard
                    title="Questions"
                    value={questions.length}
                    icon={MessageSquareText}
                    iconClassName="text-blue-600"
                    iconContainerClassName="bg-blue-100"
                />

                <SurveyInfoCard
                    title="Last Edited"
                    value={parseDate(survey.updatedAt)}
                    icon={CalendarMinus2}
                    iconClassName="text-orange-600"
                    iconContainerClassName="bg-orange-100"
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
                            <Card key={question.questionId} className="w-full !max-w-none p-6 max-h-fit">
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold">{question.prompt}</h2>
                                    {question.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
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