import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X } from "lucide-react";

import { QuestionType } from "@shared/models/dtos/enums/QuestionType";
import type { QuestionDTO, RatingDTO } from "@shared/models/dtos/types/QuestionDTO";

type Props = {
    q: QuestionDTO;
    index: number;

    changeQuestionType: (index: number, type: QuestionType) => void;
    deleteQuestion: (index: number) => void;

    updateQuestion: (index: number, updater: (prev: QuestionDTO) => QuestionDTO) => void;

    addOption: (index: number) => void;
    updateOption: (index: number, optionIndex: number, value: string) => void;
    removeOption: (index: number, optionIndex: number) => void;

    RATING_SCALE_MIN: number;
    RATING_SCALE_MAX: number;
    parseOptionalInt: (value: string) => number | undefined;
    clampInt: (n: number, min: number, max: number) => number;
};

export default function QuestionCard(props: Props) {
    const {
        q,
        index,
        changeQuestionType,
        deleteQuestion,
        updateQuestion,
        addOption,
        updateOption,
        removeOption,
        RATING_SCALE_MIN,
        RATING_SCALE_MAX,
        parseOptionalInt,
        clampInt,
    } = props;

    return (
        <Card className="border border-border bg-card shadow-none">
            <CardHeader className="border-b border-border">
                <CardTitle className="text-base font-semibold">Question {index + 1}</CardTitle>

                <CardAction className="flex items-center gap-2">
                    <Select
                        value={q.type}
                        onValueChange={(value) => changeQuestionType(index, value as QuestionType)}
                    >
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Questions Types</SelectLabel>
                                <SelectItem value={QuestionType.MultipleChoice}>Multiple Choice</SelectItem>
                                <SelectItem value={QuestionType.CheckBox}>Checkbox</SelectItem>
                                <SelectItem value={QuestionType.ShortAnswer}>Short Answer</SelectItem>
                                <SelectItem value={QuestionType.Rating}>Rating (scale)</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => deleteQuestion(index)}
                        aria-label="Delete question"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardAction>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                    <Textarea
                        id={`prompt-${q.questionId}`}
                        value={q.prompt}
                        onChange={(e) => updateQuestion(index, (prev) => ({ ...prev, prompt: e.target.value }))}
                        placeholder="Your prompt..."
                        rows={1}
                        className="resize-none border-0 border-b border-border bg-transparent px-0 text-base outline-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0 pl-3 rounded-2xl"
                    />
                </div>

                {(q.type === QuestionType.MultipleChoice || q.type === QuestionType.CheckBox) && (
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Options</Label>

                        <div className="space-y-2">
                            {q.options.map((opt, optIndex) => (
                                <div key={`${q.questionId}-opt-${optIndex}`} className="flex items-center gap-2">
                                    <div
                                        className={[
                                            "shrink-0",
                                            "h-4 w-4",
                                            "border border-border",
                                            "bg-background",
                                            q.type === QuestionType.MultipleChoice ? "rounded-full" : "rounded-[3px]",
                                        ].join(" ")}
                                    />

                                    <Input
                                        value={opt}
                                        onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                        className="h-9"
                                        placeholder={`Option ${optIndex + 1}`}
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-foreground"
                                        onClick={() => removeOption(index, optIndex)}
                                        aria-label="Remove option"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => addOption(index)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add option
                        </Button>
                    </div>
                )}

                {q.type === QuestionType.ShortAnswer && (
                    <div className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-sm text-muted-foreground">
                        Short answer (respondents will type a response).
                    </div>
                )}

                {q.type === QuestionType.Rating && (
                    <div className="space-y-4">
                        <Label className="text-sm font-medium">Rating scale</Label>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Min</Label>
                                <Input
                                    type="number"
                                    min={RATING_SCALE_MIN}
                                    max={RATING_SCALE_MAX}
                                    value={q.scaleMin}
                                    onChange={(e) => {
                                        const next = parseOptionalInt(e.target.value);

                                        updateQuestion(index, (prev) => {
                                            const rating = prev as RatingDTO;
                                            if (next === undefined) return rating;

                                            const safeMin = clampInt(next, RATING_SCALE_MIN, RATING_SCALE_MAX);
                                            const safeMax = clampInt(
                                                Math.max(safeMin, rating.scaleMax),
                                                RATING_SCALE_MIN,
                                                RATING_SCALE_MAX
                                            );

                                            return { ...rating, scaleMin: safeMin, scaleMax: safeMax };
                                        });
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Max</Label>
                                <Input
                                    type="number"
                                    min={RATING_SCALE_MIN}
                                    max={RATING_SCALE_MAX}
                                    value={q.scaleMax}
                                    onChange={(e) => {
                                        const next = parseOptionalInt(e.target.value);

                                        updateQuestion(index, (prev) => {
                                            const rating = prev as RatingDTO;
                                            if (next === undefined) return rating;

                                            const rawMax = clampInt(next, RATING_SCALE_MIN, RATING_SCALE_MAX);
                                            const safeMax = Math.max(rating.scaleMin, rawMax);

                                            return { ...rating, scaleMax: safeMax };
                                        });
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Label (min)</Label>
                                <Input
                                    value={q.labelMin ?? ""}
                                    onChange={(e) =>
                                        updateQuestion(index, (prev) => ({
                                            ...(prev as RatingDTO),
                                            labelMin: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Poor"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Label (max)</Label>
                                <Input
                                    value={q.labelMax ?? ""}
                                    onChange={(e) =>
                                        updateQuestion(index, (prev) => ({
                                            ...(prev as RatingDTO),
                                            labelMax: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Excellent"
                                />
                            </div>
                        </div>

                        {/* Preview desktop */}
                        <div className="hidden sm:block">
                            {(() => {
                                const min = Number.isFinite(q.scaleMin) ? q.scaleMin : 1;
                                const max = Number.isFinite(q.scaleMax) ? q.scaleMax : 5;

                                const safeMin = Math.max(0, min);
                                const safeMax = Math.max(safeMin, max);
                                const finalMax = Math.max(safeMin, safeMax);

                                const maxPreviewSteps = 11;
                                const steps = Math.min(finalMax - safeMin + 1, maxPreviewSteps);
                                const values = Array.from({ length: steps }, (_, i) => safeMin + i);

                                return (
                                    <div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/10 p-4">
                                        <p className="text-xs font-medium text-muted-foreground">Preview</p>

                                        <div className="flex items-center justify-between gap-3">
                                            <span className="min-w-16 text-xs text-muted-foreground">{q.labelMin ?? ""}</span>

                                            <div className="flex flex-1 items-center justify-center gap-4">
                                                {values.map((v) => (
                                                    <div key={v} className="flex flex-col items-center gap-1">
                                                        <div className="h-4 w-4 rounded-full border border-border bg-card" />
                                                        <span className="text-xs text-muted-foreground">{v}</span>
                                                    </div>
                                                ))}

                                                {safeMax - safeMin + 1 > maxPreviewSteps && (
                                                    <span className="text-xs text-muted-foreground">…</span>
                                                )}
                                            </div>

                                            <span className="min-w-16 text-right text-xs text-muted-foreground">
                                            {q.labelMax ?? ""}
                                        </span>
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            Scale: {safeMin} to {safeMax}
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>


                        {/*Preview mobile*/}
                        <div className="sm:hidden">
                            {(() => {
                                const min = Number.isFinite(q.scaleMin) ? q.scaleMin : 1;
                                const max = Number.isFinite(q.scaleMax) ? q.scaleMax : 5;

                                const safeMin = Math.max(0, min);
                                const safeMax = Math.max(safeMin, max);

                                const maxPreviewSteps = 11;
                                const steps = Math.min(safeMax - safeMin + 1, maxPreviewSteps);
                                const values = Array.from({ length: steps }, (_, i) => safeMin + i);

                                return (
                                    <div className="rounded-lg border border-dashed border-border bg-muted/10 p-3">
                                        <div className="flex items-center justify-center gap-2">
                                            {values.map((v) => (
                                                <div key={v} className="flex flex-col items-center gap-1">
                                                    <div className="h-3 w-3 rounded-full border border-border bg-card" />
                                                    <span className="text-[10px] text-muted-foreground">{v}</span>
                                                </div>
                                            ))}
                                            {safeMax - safeMin + 1 > maxPreviewSteps && (
                                                <span className="text-[10px] text-muted-foreground">…</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}