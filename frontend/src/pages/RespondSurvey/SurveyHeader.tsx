import { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";

type Props = {
  survey: SurveyDTO;
};

export default function SurveyHeader({ survey }: Props) {
  return (
    <div className="space-y-3 pb-4 border-b">
      <h1 className="text-3xl font-bold">{survey.title}</h1>
      {survey.description && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Survey's description</p>
          <p className="text-base text-muted-foreground">{survey.description}</p>
        </div>
      )}
    </div>
  );
}
