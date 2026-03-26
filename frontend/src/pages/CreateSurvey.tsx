// http://localhost:5173/admin-dashboard/surveys/new

import { useState } from "react";

// shadcn-style UI components
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";

export default function CreateSurvey() {
    // Local state for the survey header fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    return (
        // Center the content and keep it at a readable max width
        // space-y-6 = vertical spacing between future sections (header card, questions, buttons, etc.)
        <div className="mx-auto w-full max-w-3xl space-y-6 p-15">
            <Card className="border border-border bg-background shadow-none">
                {/* CardContent provides consistent padding */}
                <CardContent className="space-y-12 p-12">
                    {/* Title field */}
                    <div className="space-y-2">
                        <Input
                            id="survey-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled survey"
                            className="h-12 rounded-none border-0 border-b border-border bg-transparent px-0 text-2xl font-semibold tracking-wide outline-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
                        />
                    </div>

                    {/* Description field */}
                    <div className="space-y-2">
                        <Textarea
                            id="survey-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this survey is about..."
                            rows={3}
                            className="resize-none rounded-none border-0 border-b border-border bg-transparent px-0 text-base outline-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
                        />
                    </div>
                </CardContent>
            </Card>

            {/*
        Question cards list (map over questions[])
        Add New button
        Left panel controls (Back / Publish / Autosave) if you do 2-column layout
      */}
        </div>
    );
}