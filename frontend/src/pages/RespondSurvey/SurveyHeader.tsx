import { Card, CardContent } from "@/components/ui/card";
import { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";

type Props = {
  survey: SurveyDTO;
};

export default function SurveyHeader({ survey }: Props) {
  const getStatusBadge = (status?: SurveyStatus) => {
    const statusValue = status || SurveyStatus.Active;
    const statusMap: Record<SurveyStatus, { bg: string; text: string }> = {
      [SurveyStatus.New]: { bg: "bg-blue-100", text: "text-blue-800" },
      [SurveyStatus.Active]: { bg: "bg-green-100", text: "text-green-800" },
      [SurveyStatus.Closed]: { bg: "bg-yellow-100", text: "text-yellow-800" },
    };
    const style = statusMap[statusValue];
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}
      >
        {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
      </span>
    );
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="space-y-3 p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{survey.title}</h1>
          {getStatusBadge(survey.status)}
        </div>
        {survey.description && (
          <p className="text-muted-foreground">{survey.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
