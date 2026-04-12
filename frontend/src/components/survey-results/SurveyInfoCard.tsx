import Card from "@/components/common/Card";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type SurveyInfoCardProps = {
    title: string;
    value: ReactNode;
    icon: LucideIcon;
    iconClassName?: string;
    iconContainerClassName?: string;
};

function formatValue(value: ReactNode): ReactNode {
    if (value instanceof Date) {
        return value.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    return value;
}

export default function SurveyInfoCard({
                                           title,
                                           value,
                                           icon: Icon,
                                           iconClassName = "text-primary",
                                           iconContainerClassName = "bg-muted/70",
                                       }: SurveyInfoCardProps) {
    return (
        <Card className="rounded-3xl border border-border bg-card px-6 py-5 shadow-sm">
            <div className="flex items-center gap-4">
                <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconContainerClassName}`}
                >
                    <Icon className={`h-7 w-7 ${iconClassName}`} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                        {title}
                    </p>
                    <div className="mt-1 font-semibold tracking-tight text-foreground">
                        {formatValue(value)}
                    </div>
                </div>
            </div>
        </Card>
    );
}