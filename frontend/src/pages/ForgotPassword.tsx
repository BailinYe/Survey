import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import { auth, db } from "@/firebase/firebase";
import { Button } from "@/components/ui/button";
import PopupWindow from "@/components/PopupWindow";
import Logo from "@/components/common/Logo";

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
        } catch (resetError: unknown) {
            const errorCode = getErrorCode(resetError);

            if (errorCode === "auth/invalid-email") {
                setError("Invalid email format.");
                return;
            }

            if (errorCode === "auth/too-many-requests") {
                setError("Too many requests. Please try again later.");
                return;
            }

            setError(getErrorMessage(resetError));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-4 text-foreground md:px-6 md:py-6 lg:px-8">
            {showSuccessPopup && (
                <PopupWindow
                    text={
                        <>
                            <p className="text-xl font-bold">
                                Password reset email sent successfully!
                            </p>
                            <p className="mt-2 text-base font-normal">
                                Please check your inbox or spam folder for the password reset link.
                            </p>
                        </>
                    }
                    firstButtonText="Go back to Login page"
                    onFirstClick={() => navigate("/auth/login")}
                />
            )}

            <section className="mx-auto w-full max-w-7xl rounded-[32px] border border-border bg-background shadow-sm">
                <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="hidden border-r border-border lg:flex lg:flex-col lg:justify-between lg:p-10">
                        <div>
                            <div className="inline-flex rounded-[24px] border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                                <Logo className="h-auto w-36" />
                            </div>

                            <div className="mt-10 max-w-md">
                                <p className="mb-3 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                    Account recovery
                                </p>

                                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                                    Reset your password and get back into your account
                                </h1>

                                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                    Enter your email address and we will send you a secure reset link so you can choose a new password.
                                </p>
                            </div>
                        </div>

                        <div className="grid max-w-md grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Secure</p>
                                <p className="mt-1 text-sm font-semibold">Reset flow</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Fast</p>
                                <p className="mt-1 text-sm font-semibold">Email delivery</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Simple</p>
                                <p className="mt-1 text-sm font-semibold">Recovery steps</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Direct</p>
                                <p className="mt-1 text-sm font-semibold">Access recovery</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
                        <div className="w-full max-w-md">
                            <div className="mb-8 lg:hidden">
                                <div className="inline-flex rounded-[24px] border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                                    <Logo className="h-auto w-32" />
                                </div>
                            </div>

                            <div className="mb-8">
                                <p className="mb-3 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                    Password reset
                                </p>

                                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                    Reset your password
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    Enter the email address linked to your account and we will send you instructions to reset your password.
                                </p>
                            </div>

                            <div className="rounded-[28px] border border-border bg-card px-5 py-5 shadow-sm sm:px-6 sm:py-6">
                                <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-left text-sm font-medium">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            type="email"
                                            className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition focus:border-ring"
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    {error && (
                                        <div className="rounded-xl border border-red-400/50 bg-red-100 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 pt-2">
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
                                            className="min-w-[250px] rounded-full px-8 disabled:opacity-60"
                                        >
                                            {loading ? "Sending..." : "Reset Password"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}