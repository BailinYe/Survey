import { AnswerValue, QuestionType, RatingDTO } from "@shared/models/dtos";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {MessageSquareText, Star} from "lucide-react";

type RatingResultsProps = {
    question: RatingDTO;
    answers: AnswerValue[];
};

export default function RatingResults({
                                          question,
                                          answers,
                                      }: RatingResultsProps) {
    const ratings: number[] = answers
        .filter((answer) => answer.type === QuestionType.Rating)
        .map((answer) => answer.value);

    const totalResponses = ratings.length;

    const average =
        totalResponses > 0
            ? ratings.reduce((sum, value) => sum + value, 0) / totalResponses
            : 0;

    const distribution: Record<number, number> = {};
    for (let i = question.scaleMin; i <= question.scaleMax; i++) {
        distribution[i] = 0;
    }

    ratings.forEach((rating) => {
        distribution[rating] = (distribution[rating] || 0) + 1;
    });

    const chartData = Object.entries(distribution).map(([rating, count]) => ({
        rating,
        responses: count,
    }));

    const topRating =
        chartData.reduce(
            (best, current) => (current.responses > best.responses ? current : best),
            chartData[0] ?? { rating: "-", responses: 0 },
        );

    const chartConfig = {
        responses: {
            label: "Responses",
            color: "var(--chart-3)",
        },
    } satisfies ChartConfig;

    const ratingColors = [
        "var(--chart-1)",
        "var(--chart-2)",
        "var(--chart-3)",
        "var(--chart-4)",
        "var(--chart-5)",
    ];

    function getBarColor(rating: number) {
        const range = question.scaleMax - question.scaleMin;

        if (range <= 0) return ratingColors[0];

        const normalized = (rating - question.scaleMin) / range;
        const index = Math.min(
            ratingColors.length - 1,
            Math.max(0, Math.round(normalized * (ratingColors.length - 1))),
        );

        return ratingColors[index];
    }

    return (
        <div className="w-full space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border bg-muted/30 shadow-none">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <MessageSquareText className="h-6 w-6 text-primary" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Total responses</p>
                            <p className="text-2xl font-semibold text-foreground">
                                {ratings.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border bg-muted/30 shadow-none">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                            <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Average rating</p>
                            <div className="mt-1 flex items-end gap-2">
                                <span className="text-2xl font-semibold text-foreground">
                                    {average.toFixed(1)}
                                </span>
                                <span className="pb-0.5 text-sm text-muted-foreground">
                                    / {question.scaleMax}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border bg-muted/30 shadow-none">
                    <CardContent className="p-5 space-y-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Scale</p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                {question.labelMin ?? question.scaleMin} →{" "}
                                {question.labelMax ?? question.scaleMax}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Most selected</p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                {topRating.rating} ({topRating.responses})
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="min-w-0 border-border bg-background shadow-none">
                <CardContent className="p-4 sm:p-6">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-foreground">
                            Rating distribution
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Number of responses for each score
                        </p>
                    </div>

                    <ChartContainer
                        config={chartConfig}
                        className="h-[240px] w-full"
                    >
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="rating"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tickLine={false}
                                axisLine={false}
                                width={28}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="responses" radius={8}>
                                {chartData.map((entry) => (
                                    <Cell
                                        key={`cell-${entry.rating}`}
                                        fill="var(--chart-3)"
                                        fillOpacity={getBarColor(entry.responses)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}