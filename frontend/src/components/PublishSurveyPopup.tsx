import React, { useState } from "react";

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-center text-2xl font-semibold">
                    Publish your survey
                </h2>

                <div className="mb-4">
                    <label className="mb-2 block font-medium">Link</label>
                    <input
                        type="text"
                        value={surveyLink}
                        readOnly
                        className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                    />
                </div>

                <div className="mb-4">
                    <label className="mb-2 block font-medium">Send to...</label>

                    <div className="flex min-h-[130px] flex-col justify-between rounded-md border p-3">
                        <div className="flex flex-wrap gap-2">
                            {emails.map((email) => (
                                <div
                                    key={email}
                                    className="flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm text-gray-700"
                                >
                                    <span>{email}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEmail(email)}
                                        className="font-semibold text-gray-500 hover:text-red-600"
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
                                className="flex-1 rounded-md border px-3 py-2"
                            />
                            <button
                                type="button"
                                onClick={handleAddEmail}
                                className="rounded-full bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                <div className="flex flex-col items-center gap-3">
                    <button
                        type="button"
                        onClick={handlePublishClick}
                        className="w-40 rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Publish
                    </button>

                    <button
                        type="button"
                        onClick={onBack}
                        className="w-40 rounded-full bg-black px-4 py-2 text-white hover:bg-gray-800"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}