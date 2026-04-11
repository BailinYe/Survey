import { AnswerValue, QuestionType } from "@shared/models/dtos";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquareText } from "lucide-react";

type ShortAnswerValue = AnswerValue & {
    type: QuestionType.ShortAnswer;
    value: string;
};

type ShortAnswerResultProps = {
    answers: ShortAnswerValue[];
};

export default function ShortAnswerResults({ answers }: ShortAnswerResultProps) {
    const shortAnswers: string[] = answers
        .filter(
            (answer: AnswerValue) =>
                answer.type === QuestionType.ShortAnswer &&
                typeof answer.value === "string" &&
                answer.value.trim() !== "",
        )
        .map((answer: ShortAnswerValue): string => answer.value.trim());

    if (shortAnswers.length === 0) {
        return <p className="text-sm text-muted-foreground">No responses yet.</p>;
    }

    const averageWordCount =
        shortAnswers.length > 0
            ? Math.round(
                shortAnswers.reduce(
                    (sum, text) => sum + text.split(/\s+/).filter(Boolean).length,
                    0,
                ) / shortAnswers.length,
            )
            : 0;

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border bg-muted/30 shadow-none">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <MessageSquareText className="h-6 w-6 text-primary" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Total responses</p>
                            <p className="text-2xl font-semibold text-foreground">
                                {shortAnswers.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border bg-muted/30 shadow-none">
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">Average response length</p>
                        <p className="mt-1 text-lg font-medium text-foreground">
                            {averageWordCount} words
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border bg-background shadow-none">
                <CardContent className="p-4 sm:p-6">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-foreground">
                            Submitted responses
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Review all written answers submitted for this question
                        </p>
                    </div>

                    <ScrollArea className="h-[320px] pr-4">
                        <div className="space-y-3">
                            {shortAnswers.map((text: string, index: number) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-border bg-muted/30 p-4"
                                >
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center rounded-full bg-[var(--chart-3)]/10 px-3 py-1 text-xs font-medium text-[var(--chart-3)]">
                                            Response {index + 1}
                                        </span>
                                    </div>

                                    <p className="text-sm leading-6 text-foreground whitespace-pre-wrap break-words">
                                        {text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}