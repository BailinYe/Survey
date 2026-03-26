import Card from "@/components/common/Card";
import type { LucideIcon } from "lucide-react";

type SurveyInfoCardProps = {
    title: string;
    value: string | Date | number;
    icon: LucideIcon;
    iconClassName?: string;
    iconContainerClassName?: string;
};

function formatValue(value: string | Date | number): string {
    if (value instanceof Date) {
        return value.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    return String(value);
}

export default function SurveyInfoCard({title, value, icon: Icon, iconClassName = "text-primary", iconContainerClassName = "bg-muted/70"}: SurveyInfoCardProps) {

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
                    <p className="mt-1 font-semibold tracking-tight text-foreground whitespace-nowrap">
                        {formatValue(value)}
                    </p>
                </div>
            </div>
        </Card>
    );
}