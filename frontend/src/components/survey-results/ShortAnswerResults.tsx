import {AnswerValue, QuestionType} from "@shared/models/dtos";

type ShortAnswerValue = AnswerValue & {
    type: QuestionType.ShortAnswer;
    value: string;
};

export default function ShortAnswerResults({ answers }: { answers: AnswerValue[] }) {

    // todo: Add pagination for short answers results

    const shortAnswers: string[] = answers
        .filter(
            (answer: AnswerValue) =>
                answer.type === QuestionType.ShortAnswer &&
                typeof answer.value === "string" &&
                answer.value.trim() !== "",
        )
        .map((answer: ShortAnswerValue): string => answer.value);

    if (shortAnswers.length === 0) {
        return <p className="text-sm text-muted-foreground">No responses yet.</p>;
    }

    return (
        <div className="space-y-3">
            {shortAnswers.map((text: string, index: number) => (
                <div key={index} className="rounded-lg border p-3">
                    {text}
                </div>
            ))}
        </div>
    );
}