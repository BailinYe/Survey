import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import * as React from "react";

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

export default function OTPVerification() {
    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    function handleVerifySubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        void verifyOtp();
    }

    async function verifyOtp() {
        setError("");
        setMessage("");

        const email = localStorage.getItem("otpEmail");

        if (!email) {
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
                body: JSON.stringify({ email, code }),
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

        const email = localStorage.getItem("otpEmail");

        if (!email) {
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
                body: JSON.stringify({ email }),
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

    return (
        <div>
            <h1>OTP Verification</h1>
            <p>Enter the 6-digit code sent to your email.</p>

            <form onSubmit={handleVerifySubmit}>
                <div>
                    <label htmlFor="otp-code">Verification Code</label>
                    <input
                        id="otp-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                    />
                </div>

                {error && <p>{error}</p>}
                {message && <p>{message}</p>}

                <Button
                    name={loading ? "Verifying..." : "Verify Code"}
                    type="submit"
                    onClick={() => {}}
                />
            </form>

            <br />

            <Button
                name={resending ? "Sending..." : "Resend Code"}
                onClick={handleResendCode}
            />
        </div>
    );
}