
import React, { useState } from "react";

import {Button} from "@/components/ui/button"

import {Clipboard, ClipboardCheck} from "lucide-react";
import { toast } from "sonner";

type PublishSurveyPopupProps = {
    surveyLink: string;
    onBack: () => void;
    onPublish: (emails: string[]) => void;
};

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function PublishSurveyPopup({
                                               surveyLink,
                                               onBack,
                                               onPublish,
                                           }: Readonly<PublishSurveyPopupProps>) {

    const [emailInput, setEmailInput] = useState("");
    const [emails, setEmails] = useState<string[]>([]);
    const [error, setError] = useState("");

    const [clipboard, setClipboard] = useState<boolean>(false);

    function handleAddEmail() {
        const trimmedEmail = emailInput.trim().toLowerCase();

        if (!trimmedEmail) {
            return;
        }

        if (!isValidEmail(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (emails.includes(trimmedEmail)) {
            setError("This email is already added.");
            return;
        }

        setEmails((prev) => [...prev, trimmedEmail]);
        setEmailInput("");
        setError("");
    }

    function handleRemoveEmail(emailToRemove: string) {
        setEmails((prev) => prev.filter((email) => email !== emailToRemove));
    }

    function handlePublishClick() {
        onPublish(emails);
    }

    async function handleCopyLink() {
        setClipboard(true);
        try {
            await navigator.clipboard.writeText(surveyLink);
            toast.success("Survey link copied to clipboard.", {position: "top-center"});
        } catch (error) {
            console.error("Failed to copy survey link:", error);
            toast.error("Failed to copy survey link.");
        } finally {
            setTimeout(()=> {
                setClipboard(false);
            }, 4000);
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl">
                    <h2 className="mb-4 text-center text-2xl font-semibold">
                        Publish your survey
                    </h2>

                    <div className="mb-4 cursor-pointer">
                        <label className="mb-2 block font-medium text-card-foreground">Link</label>

                        <div className="relative">
                            <input
                                type="text"
                                value={surveyLink}
                                readOnly
                                className="w-full rounded-md border border-border bg-muted py-2 pl-3 pr-11 text-muted-foreground"
                                onFocus={handleCopyLink}
                            />

                            <button
                                type="button"
                                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                                aria-label="Copy survey link"
                                title="Copy survey link"
                                onClick={handleCopyLink}
                            >
                                {!clipboard?<Clipboard className="h-4 w-4" />:<ClipboardCheck className="h-4 w-4" />}

                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="mb-2 block font-medium text-card-foreground">Send to...</label>

                        <div className="flex min-h-[130px] flex-col justify-between rounded-md border border-border bg-background/60 p-3">
                            <div className="flex flex-wrap gap-2">
                                {emails.map((email) => (
                                    <div
                                        key={email}
                                        className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
                                    >
                                        <span>{email}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEmail(email)}
                                            className="font-semibold text-muted-foreground transition hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type email here..."
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddEmail}
                                    className="rounded-full bg-primary px-5 py-2 text-primary-foreground transition hover:opacity-90"
                                >
                                    Add
                                </Button>
                            </div>
                        </div>

                        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <Button
                            type="button"
                            onClick={handlePublishClick}
                            className="w-40 rounded-full bg-primary px-4 py-2 text-primary-foreground transition hover:opacity-90"
                        >
                            Publish
                        </Button>

                        <Button
                            type="button"
                            onClick={onBack}
                            className="w-40 rounded-full border border-border bg-secondary px-4 py-2 text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground"
                        >
                            Back
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}