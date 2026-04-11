import { AnswerValue, QuestionType, MultipleChoiceDTO } from "@shared/models/dtos";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";
import {MessageSquareText} from "lucide-react";

type MultipleChoiceResultsProps = {
    question: MultipleChoiceDTO;
    answers: AnswerValue[];
};

export default function MultipleChoiceResults({
                                                  question,
                                                  answers,
                                              }: MultipleChoiceResultsProps) {
    const counts: Record<string, number> = question.options.reduce<Record<string, number>>(
        (acc, option: string) => {
            acc[option] = 0;
            return acc;
        },
        {},
    );

    answers.forEach((answer: AnswerValue): void => {
        if (answer.type === QuestionType.MultipleChoice) {
            counts[answer.value] = (counts[answer.value] || 0) + 1;
        }
    });

    const totalResponses = answers.filter(
        (answer: AnswerValue) => answer.type === QuestionType.MultipleChoice,
    ).length;

    const sortedOptions = [...question.options].sort((a, b) => counts[b] - counts[a]);
    const topCount = sortedOptions.length > 0 ? counts[sortedOptions[0]] : 0;

    const chartData = sortedOptions.map((option) => ({
        option,
        responses: counts[option],
        percentage: totalResponses > 0 ? Math.round((counts[option] / totalResponses) * 100) : 0,
    }));

    const pieColors = [
        "var(--chart-1)",
        "var(--chart-2)",
        "var(--chart-3)",
        "var(--chart-4)",
        "var(--chart-5)",
    ];

    const chartConfig = {
        responses: {
            label: "Responses",
            color: "var(--chart-3)",
        },
    } satisfies ChartConfig;

    const progressColors = [
        "bg-[var(--chart-1)]",
        "bg-[var(--chart-2)]",
        "bg-[var(--chart-3)]",
        "bg-[var(--chart-4)]",
        "bg-[var(--chart-5)]",
    ];

    return (
        <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-4">
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

                <div className="space-y-3 w-full">
                    {sortedOptions.map((option: string) => {
                        const count = counts[option];
                        const percentage =
                            totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;

                        const isTopOption = count === topCount && topCount > 0;

                        return (
                            <div
                                key={option}
                                className={`rounded-xl border p-4 transition-colors ${
                                    isTopOption
                                        ? "border-primary/30 bg-primary/5"
                                        : "border-border bg-muted/30"
                                }`}
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
                                    indicatorClassName={progressColors[sortedOptions.indexOf(option) % progressColors.length]}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <Card className="min-w-0 border-border bg-background shadow-none">
                <CardContent className="p-4 sm:p-6">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-foreground">
                            Response distribution
                        </h3>
                    </div>

                    <ChartContainer
                        config={chartConfig}
                        className="h-[260px] w-full"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="responses"
                                nameKey="option"
                                innerRadius={50}
                                outerRadius={90}
                                paddingAngle={3}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${entry.option}`}
                                        fill={pieColors[index % pieColors.length]}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}