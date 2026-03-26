import {AnswerValue, QuestionType, RatingDTO} from "@shared/models/dtos";

type RatingResultsProps = {
    question: RatingDTO;
    answers: AnswerValue[];
}


export default function RatingResults({question, answers}: RatingResultsProps) {

    // todo: Add shadcn graph for rating results

    // Retrieves all ratings
    const ratings: number[] = answers
        .filter((answer) => answer.type === QuestionType.Rating)
        .map((answer) => answer.value);

    // calculates average
    const average =
        ratings.length > 0
            ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
            : 0;

    // calculates distribution
    const distribution: Record<number, number> = {};
    for (let i = question.scaleMin; i <= question.scaleMax; i++) {
        distribution[i] = 0;
    }
    ratings.forEach((rating) => {
        distribution[rating] = (distribution[rating] || 0) + 1;
    });

    return (
        <div className="space-y-4">
            <div className="rounded-lg border p-4">
                <p className="text-lg font-semibold">
                    Average Rating: {average.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    {question.labelMin ?? question.scaleMin} -{" "}
                    {question.labelMax ?? question.scaleMax}
                </p>
            </div>

            <div className="space-y-2">
                {Object.entries(distribution).map(([rating, count]: [string, number]) => (
                    <div key={rating} className="flex items-center justify-between rounded-lg border p-3">
                        <span>{rating}</span>
                        <span className="font-medium">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}