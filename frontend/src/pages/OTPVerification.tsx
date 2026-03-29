import { useMemo, useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import surveyImage from "../assets/Survey.png";

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

            const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
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

            const res = await fetch("http://localhost:3000/api/auth/send-otp", {
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
        <main className="h-screen overflow-hidden bg-background text-foreground">
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
                    <div className="w-full max-w-md text-center">
                        <div className="mb-8">
                            <h1 className="text-3xl font-semibold tracking-wide">
                                Verify your identity
                            </h1>

                            <p className="mt-6 text-sm leading-7 text-muted-foreground">
                                A verification code has been sent to{" "}
                                <span className="font-medium text-foreground">
                                    {maskedEmail || "your email"}
                                </span>
                                .
                                <br />
                                Enter the code to continue.
                            </p>
                        </div>

                        <form onSubmit={handleVerifySubmit} className="space-y-6">
                            <div className="flex justify-center gap-3">
                                {OTP_BOX_IDS.map((inputId, index) => (
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
                                        className="h-12 w-12 rounded-md border border-border bg-background text-center text-lg font-semibold outline-none transition-colors focus:border-foreground"
                                    />
                                ))}
                            </div>

                            <div className="space-y-2">
                                {error && (
                                    <p className="text-center text-sm font-medium text-red-500">
                                        {error}
                                    </p>
                                )}

                                {message && (
                                    <p className="text-center text-sm font-medium text-green-600">
                                        {message}
                                    </p>
                                )}
                            </div>

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

                            <div className="flex items-center justify-center pt-10">
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={loading}
                                    className="min-w-[260px] rounded-full bg-black text-white transition-colors duration-200 hover:bg-zinc-800 disabled:opacity-60"
                                >
                                    {loading ? "Verifying..." : "Login"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}