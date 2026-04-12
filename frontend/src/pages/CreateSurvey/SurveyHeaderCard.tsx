import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
    title: string;
    description: string;
    setTitle: (v: string) => void;
    setDescription: (v: string) => void;
};

export default function SurveyHeaderCard({
    title,
    description,
    setTitle,
    setDescription,
}: Props) {
    return (
        <Card className="border border-border bg-card shadow-none">
            <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                    <Input
                        id="survey-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled survey"
                        className="h-12 rounded-2xl border-0 border-b border-border bg-transparent px-0 text-2xl
                                   font-semibold tracking-wide outline-none ring-0 placeholder:text-muted-foreground
                                   focus-visible:ring-0 pl-3"
                    />
                </div>

                <div className="space-y-2">
                    <Textarea
                        id="survey-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Survey description..."
                        rows={1}
                        className="resize-none border-0 border-b border-border bg-transparent px-0
                                   text-base outline-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0
                                   pl-3 rounded-2xl"
                    />
                </div>
            </CardContent>
        </Card>
    );
}