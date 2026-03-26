import {AnswerValue, QuestionType, CheckBoxDTO} from "@shared/models/dtos";



export default function CheckBoxResults({question, answers}: { question: CheckBoxDTO; answers: AnswerValue[];}) {


    // todo: Add shadcn graph for checkbox results

    const counts: Record<string, number> = question.options.reduce<Record<string, number>>((acc, option: string): Record<string, number> => {
        acc[option] = 0;
        return acc;
    }, {});

    answers.forEach((answer: AnswerValue): void => {
        if (answer.type === QuestionType.CheckBox) {
            answer.value.forEach((selected: string): void => {
                counts[selected] = (counts[selected] || 0) + 1;
            });
        }
    });

    return (
        <div className="space-y-2">
            {question.options.map((option) => (
                <div key={option} className="flex items-center justify-between rounded-lg border p-3">
                    <span>{option}</span>
                    <span className="font-medium">{counts[option]}</span>
                </div>
            ))}
        </div>
    );
}