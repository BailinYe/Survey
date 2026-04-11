import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

import { QuestionType } from "@shared/models/dtos/enums/QuestionType";
import type {
    QuestionDTO,
    MultipleChoiceDTO,
    CheckBoxDTO,
    RatingDTO,
} from "@shared/models/dtos/types/QuestionDTO";
import type { AnswerValue } from "@shared/models/dtos/types/ResponseDTO";

type Props = {
    question: QuestionDTO;
    index: number;
    answer: AnswerValue | undefined;
    onAnswerChange: (questionId: string, answer: AnswerValue) => void;
    validationError?: string;
};

export default function ResponseCard(props: Props) {
    const { question, index, answer, onAnswerChange, validationError } = props;

    const handleMultipleChoiceChange = (value: string) => {
        onAnswerChange(question.questionId, {
            type: QuestionType.MultipleChoice,
            value,
        });
    };

    const handleCheckBoxChange = (option: string, checked: boolean) => {
        const currentValue =
            answer?.type === QuestionType.CheckBox ? answer.value : [];
        const newValue = checked
            ? [...currentValue, option]
            : currentValue.filter((v) => v !== option);

        onAnswerChange(question.questionId, {
            type: QuestionType.CheckBox,
            value: newValue,
        });
    };

    const handleShortAnswerChange = (value: string) => {
        onAnswerChange(question.questionId, {
            type: QuestionType.ShortAnswer,
            value,
        });
    };

    const handleRatingChange = (value: number) => {
        onAnswerChange(question.questionId, {
            type: QuestionType.Rating,
            value,
        });
    };

    return (
        <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border">
                <CardTitle className="text-base font-semibold">
                    Question {index + 1}
                    {question.required && <span className="ml-1 text-red-500 dark:text-red-400">*</span>}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                    <p className="text-base font-medium text-card-foreground">{question.prompt}</p>
                    {question.description && (
                        <p className="text-sm text-muted-foreground">{question.description}</p>
                    )}
                </div>

                {question.type === "multipleChoice" && (
                    <div className="space-y-3">
                        <RadioGroup
                            value={
                                answer?.type === QuestionType.MultipleChoice
                                    ? answer.value
                                    : undefined
                            }
                            onValueChange={handleMultipleChoiceChange}
                        >
                            {(question as MultipleChoiceDTO).options.map((option, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <RadioGroupItem value={option} id={`${question.questionId}-${idx}`} />
                                    <Label
                                        htmlFor={`${question.questionId}-${idx}`}
                                        className="cursor-pointer text-card-foreground"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                )}

                {question.type === "checkBox" && (
                    <div className="space-y-3">
                        {(question as CheckBoxDTO).options.map((option, idx) => {
                            const isChecked =
                                answer?.type === QuestionType.CheckBox &&
                                answer.value.includes(option);

                            return (
                                <div key={idx} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`${question.questionId}-${idx}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                            handleCheckBoxChange(option, checked === true)
                                        }
                                    />
                                    <Label
                                        htmlFor={`${question.questionId}-${idx}`}
                                        className="cursor-pointer text-card-foreground"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            );
                        })}

                        {(question as CheckBoxDTO).minSelect !== undefined && (
                            <p className="text-xs text-muted-foreground">
                                Select at least {(question as CheckBoxDTO).minSelect} option(s)
                            </p>
                        )}

                        {(question as CheckBoxDTO).maxSelect !== undefined && (
                            <p className="text-xs text-muted-foreground">
                                Select at most {(question as CheckBoxDTO).maxSelect} option(s)
                            </p>
                        )}
                    </div>
                )}

                {question.type === "shortAnswer" && (
                    <div className="space-y-2">
                        <Textarea
                            value={
                                answer?.type === QuestionType.ShortAnswer ? answer.value : ""
                            }
                            onChange={(e) => handleShortAnswerChange(e.target.value)}
                            placeholder="Type your answer here..."
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                )}

                {question.type === "rating" && (
                    <div className="space-y-4">
                        {(() => {
                            const ratingQ = question as RatingDTO;
                            const currentValue =
                                answer?.type === QuestionType.Rating ? answer.value : undefined;

                            const values = Array.from(
                                { length: ratingQ.scaleMax - ratingQ.scaleMin + 1 },
                                (_, i) => ratingQ.scaleMin + i
                            );

                            return (
                                <>
                                    <div className="flex items-center justify-between gap-3">
                    <span className="min-w-16 text-xs text-muted-foreground">
                      {ratingQ.labelMin ?? ""}
                    </span>

                                        <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4">
                                            {values.map((v) => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => handleRatingChange(v)}
                                                    className="group flex flex-col items-center gap-1"
                                                >
                                                    <div
                                                        className={`h-8 w-8 rounded-full border-2 transition-all sm:h-10 sm:w-10 ${
                                                            currentValue !== undefined && v <= currentValue
                                                                ? "border-primary bg-primary"
                                                                : "border-border bg-background group-hover:border-primary/50"
                                                        }`}
                                                    />
                                                    <span className="text-xs text-muted-foreground">{v}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <span className="min-w-16 text-right text-xs text-muted-foreground">
                      {ratingQ.labelMax ?? ""}
                    </span>
                                    </div>

                                    <p className="text-center text-xs text-muted-foreground">
                                        Scale: {ratingQ.scaleMin} to {ratingQ.scaleMax}
                                    </p>
                                </>
                            );
                        })()}
                    </div>
                )}

                {validationError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
                )}
            </CardContent>
        </Card>
    );
}