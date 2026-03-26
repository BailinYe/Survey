
// used for caching and performance
import {useMemo} from "react";

// Components
import Card from "@/components/common/Card";
import { QuestionType } from "@shared/models/dtos/enums/QuestionType";
import {AnswerValue, ResponseDTO} from "@shared/models/dtos/types/ResponseDTO";
import MultipleChoiceResults from "@/components/survey-results/MultipleChoiceResults";
import CheckBoxResults from "@/components/survey-results/CheckBoxResults";
import RatingResults from "@/components/survey-results/RatingResults";
import ShortAnswerResults from "@/components/survey-results/ShortAnswerResults";

// Data
import { SurveyResponses, Survey } from "@/mocks/tempSurveyData";
import {QuestionDTO} from "@shared/models/dtos";
import SurveyInfoCard from "@/components/survey-results/SurveyInfoCard";

// Lucide Icons
import {MessageSquareText, MessageCircle, CalendarMinus2} from "lucide-react";



export default function SurveyAnalytics() {


    // todo: Retrieve questions from Survey in ascending order
    const questions: QuestionDTO[] = useMemo((): QuestionDTO[] => {
        return [...Survey.questions].sort((a: QuestionDTO, b:QuestionDTO): number => a.position - b.position);
    }, []);


    // todo: Retrieve all responses from Database that match a given SurveyId
    const responses: ResponseDTO[] = useMemo(() => {
        return SurveyResponses;
    }, []);

    // Check if no responses
    if (questions.length === 0) {
        return (
            <div className="flex flex-col w-full px-6 lg:px-10 py-6 gap-6">
                <h1 className="text-3xl font-semibold border-b pb-2">Survey Analytics</h1>
                <p className="text-muted-foreground">No questions found for this survey.</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col w-full lg:flex-1 px-6 lg:px-10 py-6 gap-6 lg:border-l-2 lg:border-gray-200">

                <div className="border-b pb-4">
                    <h1 className="text-3xl font-semibold tracking-tight">Survey Analytics</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Event Feedback Survey
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SurveyInfoCard
                        title="Responses"
                        value={3}
                        icon={MessageCircle}
                        iconClassName="text-violet-600"
                        iconContainerClassName="bg-violet-100"
                    />

                    <SurveyInfoCard
                        title="Questions"
                        value={4}
                        icon={MessageSquareText}
                        iconClassName="text-blue-600"
                        iconContainerClassName="bg-blue-100"
                    />

                    <SurveyInfoCard
                        title="Last Edited"
                        value={new Date("2026-03-20T18:30:00Z")}
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