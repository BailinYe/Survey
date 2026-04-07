
// used for caching and performance
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

// Utilities for Date conversion from db raw value
import { parseDate } from "@/utils/date";

// Components
import Card from "@/components/common/Card";
import MultipleChoiceResults from "@/components/survey-results/MultipleChoiceResults";
import CheckBoxResults from "@/components/survey-results/CheckBoxResults";
import RatingResults from "@/components/survey-results/RatingResults";
import ShortAnswerResults from "@/components/survey-results/ShortAnswerResults";
import SurveyInfoCard from "@/components/survey-results/SurveyInfoCard";

// Types
import { QuestionType } from "@shared/models/dtos/enums/QuestionType";

// Dtos
import { AnswerValue, ResponseDTO } from "@shared/models/dtos/types/ResponseDTO";
import { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";
import { QuestionDTO } from "@shared/models/dtos";


import { MessageSquareText, MessageCircle, CalendarMinus2 } from "lucide-react";
import { auth } from "@/firebase/firebase";

export default function SurveyAnalytics() {

    // Stores surveyId from the query params
    const { id } = useParams<{ id: string }>();

    const [survey, setSurvey] = useState<SurveyDTO | null>(null);
    const [responses, setResponses] = useState<ResponseDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchAnalyticsData() {
            if (!id) {
                setError("Missing survey id.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError("");

                const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");
                const token = await auth.currentUser?.getIdToken();

                const [surveyRes, responsesRes] = await Promise.all([
                    fetch(`${apiUrl}/api/surveys/${id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    fetch(`${apiUrl}/api/responses/survey/${id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

                if (!surveyRes.ok) {
                    throw new Error(`Failed to fetch survey: ${surveyRes.statusText}`);
                }

                if (!responsesRes.ok) {
                    throw new Error(`Failed to fetch responses: ${responsesRes.statusText}`);
                }

                const surveyData = await surveyRes.json();
                const responsesData = await responsesRes.json();

                setSurvey(surveyData);
                console.log(surveyData);
                setResponses(responsesData || []);
                console.log(responsesData);
            } catch (err) {
                console.error("Failed to fetch analytics data:", err);
                setError(err?.message || "Failed to load analytics");
            } finally {
                setIsLoading(false);
            }
        }

        fetchAnalyticsData();
    }, [id]);

    const questions: QuestionDTO[] = useMemo(() => {
        if (!survey?.questions) return [];
        return [...survey.questions].sort((a, b) => a.position - b.position);
    }, [survey]);

    if (isLoading) {
        return (
            <div className="flex flex-col w-full px-6 lg:px-10 py-6 gap-6">
                <h1 className="text-3xl font-semibold border-b pb-2">Survey Analytics</h1>
                <p className="text-muted-foreground">Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col w-full px-6 lg:px-10 py-6 gap-6">
                <h1 className="text-3xl font-semibold border-b pb-2">Survey Analytics</h1>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="flex flex-col w-full px-6 lg:px-10 py-6 gap-6">
                <h1 className="text-3xl font-semibold border-b pb-2">Survey Analytics</h1>
                <p className="text-muted-foreground">Survey not found.</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col w-full px-6 lg:px-10 py-6 gap-6">
                <h1 className="text-3xl font-semibold border-b pb-2">Survey Analytics</h1>
                <p className="text-muted-foreground">No questions found for this survey.</p>
            </div>
        );
    }

    const lastEdited = parseDate(survey.updatedAt) ?? parseDate(survey.createdAt);

    return (
        <>
            <div className="flex flex-col w-full lg:flex-1 px-6 lg:px-10 py-6 gap-6 lg:border-l-2 lg:border-gray-200">

                <div className="border-b pb-4">
                    <h1 className="text-3xl font-semibold tracking-tight">{survey.title}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {survey.description}
                    </p>
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
                        value={survey.questions.length}
                        icon={MessageSquareText}
                        iconClassName="text-blue-600"
                        iconContainerClassName="bg-blue-100"
                    />

                    <SurveyInfoCard
                        title="Last Edited"
                        value={lastEdited}
                        icon={CalendarMinus2}
                        iconClassName="text-orange-600"
                        iconContainerClassName="bg-orange-100"
                    />
                </div>

                {/*Check if no responses submitted yet*/}
                {responses.length === 0 ? (
                    <Card className="p-6">
                        <p className="text-muted-foreground">
                            No responses submitted yet for this survey.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {questions.map((question: QuestionDTO) => {
                            const answersForQuestion: AnswerValue[] = responses
                                .map((response: ResponseDTO) => response.answers[question.questionId])
                                .filter((answer: AnswerValue): answer is AnswerValue => answer !== undefined);

                            return (
                                <Card key={question.questionId} className="p-6">
                                    <div className="mb-4">
                                        <h2 className="text-l font-semibold">{question.prompt}</h2>
                                        {question.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {question.description}
                                            </p>
                                        )}
                                    </div>

                                    {question.type === QuestionType.MultipleChoice && (
                                        <MultipleChoiceResults
                                            question={question}
                                            answers={answersForQuestion}
                                        />
                                    )}

                                    {question.type === QuestionType.CheckBox && (
                                        <CheckBoxResults
                                            question={question}
                                            answers={answersForQuestion}
                                        />
                                    )}

                                    {question.type === QuestionType.ShortAnswer && (
                                        <ShortAnswerResults answers={answersForQuestion} />
                                    )}

                                    {question.type === QuestionType.Rating && (
                                        <RatingResults
                                            question={question}
                                            answers={answersForQuestion}
                                        />
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}