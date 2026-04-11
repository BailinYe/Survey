import { AnswerValue, QuestionType, CheckBoxDTO } from "@shared/models/dtos";
import { Progress } from "@/components/ui/progress";
import {Card, CardContent} from "@/components/ui/card";
import {MessageSquareText} from "lucide-react";

export default function CheckBoxResults({
                                            question,
                                            answers,
                                        }: {
    question: CheckBoxDTO;
    answers: AnswerValue[];
}) {
    const counts: Record<string, number> = question.options.reduce<Record<string, number>>(
        (acc, option: string): Record<string, number> => {
            acc[option] = 0;
            return acc;
        },
        {},
    );

    answers.forEach((answer: AnswerValue): void => {
        if (answer.type === QuestionType.CheckBox) {
            answer.value.forEach((selected: string): void => {
                counts[selected] = (counts[selected] || 0) + 1;
            });
        }
    });

    const totalResponses = answers.filter(
        (answer: AnswerValue) => answer.type === QuestionType.CheckBox,
    ).length;

    const sortedOptions = [...question.options].sort((a, b) => counts[b] - counts[a]);

    const progressColors = [
        "bg-[var(--chart-1)]",
        "bg-[var(--chart-2)]",
        "bg-[var(--chart-3)]",
        "bg-[var(--chart-4)]",
        "bg-[var(--chart-5)]",
    ];

    return (
        <div className="space-y-8">
            <Card className="border-border bg-muted/30 shadow-none">
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <MessageSquareText className="h-6 w-6 text-primary" />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Total responses</p>
                        <p className="text-2xl font-semibold text-foreground">
                            {totalResponses}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {sortedOptions.map((option, index) => {
                    const count = counts[option];
                    const percentage =
                        totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;

                    return (
                        <div
                            key={option}
                            className="rounded-xl border border-border bg-muted/30 p-4"
                        >
                            <div className="mb-2 flex items-center justify-between gap-4">
                                <span className="text-sm font-medium text-foreground">
                                    {option}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {count} • {percentage}%
                                </span>
                            </div>

                            <Progress
                                value={percentage}
                                className="h-2"
                                indicatorClassName={progressColors[index % progressColors.length]}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}