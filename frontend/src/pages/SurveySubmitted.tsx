import { Link, useParams } from "react-router-dom";

export default function SurveySubmitted() {
    const { surveyId } = useParams<{ surveyId: string }>();

    return (
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-6 py-10 text-foreground">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                    Thank you for completing this survey
                </h1>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Your response has been submitted successfully.
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    We appreciate your time and participation.
                </p>

                <div className="mt-6 flex justify-center gap-3">
                    <Link
                        to={surveyId ? `/survey/${surveyId}` : "/"}
                        className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        Fill Again
                    </Link>

                    <Link
                        to="/"
                        className="inline-flex items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        Create my own survey
                    </Link>
                </div>
            </div>
        </main>
    );
}