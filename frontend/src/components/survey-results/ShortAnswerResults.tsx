import {AnswerValue, QuestionType} from "@shared/models/dtos";

export default function ShortAnswerResults({ answers }: { answers: AnswerValue[] }) {

    const shortAnswers: string[] = answers
        .filter((answer: AnswerValue) => answer.type === QuestionType.ShortAnswer)
        .map((answer): string => answer.value);

    if (shortAnswers.length === 0) {
        return <p className="text-sm text-muted-foreground">No responses yet.</p>;
    }

    return (
        <div className="space-y-3">
            {shortAnswers.map((text: string , index: number) => (
                <div key={index} className="rounded-lg border p-3">
                    {text}
                </div>
            ))}
        </div>
    );
}