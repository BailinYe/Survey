import {AnswerValue, QuestionType, MultipleChoiceDTO} from "@shared/models/dtos";

type MultipleChoiceResultsProps = {
    question: MultipleChoiceDTO;
    answers: AnswerValue[];
}

export default function  MultipleChoiceResults({question, answers}: MultipleChoiceResultsProps) {


    const counts: Record<string, number> = question.options.reduce<Record<string, number>>((acc, option: string) => {
        acc[option] = 0;
        return acc;
    }, {});

    answers.forEach((answer: AnswerValue): void => {
        if (answer.type === QuestionType.MultipleChoice) {
            counts[answer.value] = (counts[answer.value] || 0) + 1;
        }
    });

    return (
        <div className="space-y-2">
            {question.options.map((option: string) => (
                <div
                    key={option}
                    className="flex items-center justify-between rounded-lg border p-3"
                >
                    <span>{option}</span>
                    <span className="font-medium">{counts[option]}</span>
                </div>
            ))}
        </div>
    );
}