import { useMemo, useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/common/Logo";

function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
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

function maskEmail(email: string): string {
    const [localPart, domain] = email.split("@");

    if (!localPart || !domain) {
        return email;
    }

    if (localPart.length <= 2) {
        return `${localPart[0] ?? ""}***@${domain}`;
    }

    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

const OTP_BOX_IDS = [
    "otp-box-0",
    "otp-box-1",
    "otp-box-2",
    "otp-box-3",
    "otp-box-4",
    "otp-box-5",
] as const;

export default function OTPVerification() {
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const email = localStorage.getItem("otpEmail") ?? "";
    const maskedEmail = useMemo(() => (email ? maskEmail(email) : ""), [email]);

    function handleVerifySubmit(e: SyntheticEvent) {
        e.preventDefault();
        void verifyOtp();
    }

    async function verifyOtp() {
        setError("");
        setMessage("");

        const savedEmail = localStorage.getItem("otpEmail");

        if (!savedEmail) {
            setError("Missing login email. Please log in again.");
            return;
        }

        if (code.length !== 6) {
            setError("Please enter the 6-digit verification code.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(`${apiUrl}/api/auth/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: savedEmail, code }),
            });

            const data: { message?: string } = await res.json();

            if (!res.ok) {
                setError(data.message || "Invalid verification code.");
                return;
            }

            localStorage.removeItem("otpEmail");
            navigate("/admin-dashboard");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "OTP verification failed."));
        } finally {
            setLoading(false);
        }
    }

    async function handleResendCode() {
        setError("");
        setMessage("");

        const savedEmail = localStorage.getItem("otpEmail");

        if (!savedEmail) {
            setError("Missing login email. Please log in again.");
            return;
        }

        try {
            setResending(true);

            const res = await fetch(`${apiUrl}/api/auth/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: savedEmail }),
            });

            const data: { message?: string } = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to resend code.");
                return;
            }

            setMessage("A new verification code has been sent to your email.");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to resend code."));
        } finally {
            setResending(false);
        }
    }

    function handleCodeChange(value: string) {
        setCode(value.replace(/\D/g, "").slice(0, 6));
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-4 text-foreground md:px-6 md:py-6 lg:px-8">
            <section className="mx-auto w-full max-w-7xl rounded-[32px] border border-border bg-background shadow-sm">
                <div className="grid items-center gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="hidden border-r border-border lg:flex lg:flex-col lg:justify-between lg:p-10">
                        <div>
                            <div className="inline-flex rounded-[24px] border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                                <Logo className="h-auto w-36" />
                            </div>

                            <div className="mt-10 max-w-md">
                                <p className="mb-3 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                    Verification
                                </p>

                                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                                    Confirm your identity to continue
                                </h1>

                                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                    Enter the verification code sent to your email to securely access your account and dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="grid max-w-md grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Secure</p>
                                <p className="mt-1 text-sm font-semibold">Verification</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Quick</p>
                                <p className="mt-1 text-sm font-semibold">Access</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="mt-1 text-sm font-semibold">Code delivery</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Protected</p>
                                <p className="mt-1 text-sm font-semibold">Login flow</p>
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
                                    Account verification
                                </p>

                                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                    Verify your identity
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    A verification code has been sent to{" "}
                                    <span className="font-medium text-foreground">
                                        {maskedEmail || "your email"}
                                    </span>
                                    . Enter the code below to continue.
                                </p>
                            </div>

                            <div className="w-full rounded-[28px] border border-border bg-card px-4 py-5 shadow-sm sm:px-6 sm:py-6">                                <form onSubmit={handleVerifySubmit} className="space-y-6">
                                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">                                        {OTP_BOX_IDS.map((inputId, index) => (
                                            <input
                                                key={inputId}
                                                id={inputId}
                                                value={code[index] ?? ""}
                                                onChange={(e) => {
                                                    const nextCode = code.split("");
                                                    nextCode[index] = e.target.value.replace(/\D/g, "").slice(-1);
                                                    handleCodeChange(nextCode.join(""));
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && !code[index] && index > 0) {
                                                        const previousInput = document.getElementById(OTP_BOX_IDS[index - 1]);
                                                        previousInput?.focus();
                                                    }
                                                }}
                                                onInput={(e) => {
                                                    const target = e.currentTarget as HTMLInputElement;
                                                    if (target.value && index < OTP_BOX_IDS.length - 1) {
                                                        const nextInput = document.getElementById(OTP_BOX_IDS[index + 1]);
                                                        nextInput?.focus();
                                                    }
                                                }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                className="h-12 w-12 rounded-xl border border-input bg-card text-center text-lg font-semibold text-foreground outline-none transition focus:border-ring"
                                            />
                                        ))}
                                    </div>

                                    {(error || message) && (
                                        <div className="space-y-2">
                                            {error && (
                                                <div className="rounded-xl border border-red-400/50 bg-red-100 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                                    {error}
                                                </div>
                                            )}

                                            {message && (
                                                <div className="rounded-xl border border-green-400/50 bg-green-100 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-950/40 dark:text-green-300">
                                                    {message}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <span className="text-sm text-muted-foreground">
                                            No code received?{" "}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleResendCode}
                                            disabled={resending}
                                            className="text-sm font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {resending ? "Sending..." : "Resend Code"}
                                        </button>
                                    </div>

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
                                            className="min-w-[260px] rounded-full px-8 disabled:opacity-60"
                                        >
                                            {loading ? "Verifying..." : "Continue"}
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