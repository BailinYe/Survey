import { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";

type Props = {
    survey: SurveyDTO;
};

function formatExpiredAt(expiredAt: SurveyDTO["expiredAt"]): string {
    if (!expiredAt) {
        return "";
    }

    const parsed = new Date(expiredAt);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    return parsed.toLocaleString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function SurveyHeader({ survey }: Readonly<Props>) {
    const formattedExpiry = formatExpiredAt(survey.expiredAt);

    return (
        <div className="space-y-3 border-b border-border pb-4">
            <h1 className="text-3xl font-bold text-foreground">{survey.title}</h1>

            {survey.description && (
                <div className="space-y-1">
                    <p className="text-base text-muted-foreground">{survey.description}</p>
                </div>
            )}

            {formattedExpiry && (
                <p className="text-sm font-medium text-muted-foreground">
                    Available until {formattedExpiry}
                </p>
            )}
        </div>
    );
}