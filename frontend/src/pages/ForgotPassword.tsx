import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import { auth, db } from "@/firebase/firebase";
import { Button } from "@/components/ui/button";
import PopupWindow from "@/components/PopupWindow";
import surveyImage from "../assets/Survey.png";

function getErrorMessage(error: unknown, fallback = "Failed to send password reset email."): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
    ) {
        return (error as { message: string }).message;
    }

    return fallback;
}

function getErrorCode(error: unknown): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code: unknown }).code === "string"
    ) {
        return (error as { code: string }).code;
    }

    return "";
}

async function accountExists(normalizedEmail: string): Promise<boolean> {
    try {
        const emailQuery = query(
            collection(db, "accounts"),
            where("email", "==", normalizedEmail),
            limit(1)
        );
        const snapshot = await getDocs(emailQuery);
        return !snapshot.empty;
    } catch (error: unknown) {
        const errorCode = getErrorCode(error);

        if (errorCode !== "permission-denied") {
            throw error;
        }

        const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
        return methods.length > 0;
    }
}

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    function handleSubmit(e: SyntheticEvent) {
        e.preventDefault();
        void submitResetRequest();
    }

    async function submitResetRequest() {
        setError("");
        setShowSuccessPopup(false);

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Please enter your email.");
            return;
        }

        const actionCodeSettings = {
            url: `${globalThis.location.origin}/auth/login`,
            handleCodeInApp: false,
        };

        try {
            setLoading(true);

            const exists = await accountExists(normalizedEmail);

            if (!exists) {
                setError("No account found with this email.");
                return;
            }

            await sendPasswordResetEmail(auth, normalizedEmail, actionCodeSettings);
            setShowSuccessPopup(true);
        } catch (error: unknown) {
            const errorCode = getErrorCode(error);

            if (errorCode === "auth/invalid-email") {
                setError("Invalid email format.");
                return;
            }

            if (errorCode === "auth/too-many-requests") {
                setError("Too many requests. Please try again later.");
                return;
            }

            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="h-screen overflow-hidden bg-background text-foreground">
            {showSuccessPopup && (
                <PopupWindow
                    text={
                        <>
                            <p className="text-xl font-bold">
                                Password reset email sent successfully!
                            </p>
                            <p className="mt-2 text-base font-normal">
                                Please check your inbox or the spam folder for the password reset link.
                            </p>
                        </>
                    }
                    firstButtonText="Go back to Login page"
                    onFirstClick={() => navigate("/auth/login")}
                />
            )}

            <section className="mx-auto grid h-full max-w-7xl border border-border bg-background md:grid-cols-[280px_1fr]">
                <div className="grid h-full grid-rows-[1fr_1.4fr] border-r border-border">
                    <div className="flex items-center justify-center border-b border-border p-8">
                        <div className="flex h-40 w-40 items-center justify-center border-2 border-dashed border-border bg-muted/20 text-center text-lg font-medium text-muted-foreground">
                            Website&apos;s
                            <br />
                            logo
                        </div>
                    </div>

                    <div
                        className="h-full bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${surveyImage})` }}
                    />
                </div>

                <div className="flex items-center justify-center px-8 py-10 md:px-16">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-semibold tracking-wide">
                                Reset your Password
                            </h1>

                            <p className="mt-5 text-sm leading-7 text-muted-foreground">
                                Enter your email and follow the instructions
                                <br />
                                sent to you to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-left text-base font-medium"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    className="h-12 w-full border-0 border-b border-border bg-transparent px-0 text-base outline-none ring-0 placeholder:text-muted-foreground focus:border-foreground"
                                />
                            </div>

                            {error && (
                                <p className="text-center text-sm font-medium text-red-500">
                                    {error}
                                </p>
                            )}

                            <div className="flex items-center justify-center gap-4 pt-8">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-full"
                                    onClick={() => navigate("/auth/login")}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>

                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={loading}
                                    className="min-w-[260px] rounded-full bg-black text-white transition-colors duration-200 hover:bg-zinc-800 disabled:opacity-60"
                                >
                                    {loading ? "Sending..." : "Reset Password"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}