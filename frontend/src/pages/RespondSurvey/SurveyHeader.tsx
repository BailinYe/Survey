import { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";

type Props = {
    survey: SurveyDTO;
};

export default function SurveyHeader({ survey }: Props) {
    return (
        <div className="space-y-3 border-b border-border pb-4">
            <h1 className="text-3xl font-bold text-foreground">{survey.title}</h1>
            {survey.description && (
                <div className="space-y-1">
                    <p className="text-base text-muted-foreground">{survey.description}</p>
                </div>
            )}
        </div>
    );
}