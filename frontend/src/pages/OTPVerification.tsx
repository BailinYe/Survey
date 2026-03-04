import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function OTPVerification() {
    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setMessage("");

        const email = localStorage.getItem("otpEmail");

        if (!email) {
            setError("Missing login email. Please log in again.");
            return;
        }

        if (!code || code.length !== 6) {
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

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Invalid verification code.");
                return;
            }

            localStorage.removeItem("otpEmail");
            navigate("/admin-dashboard");
        } catch (err: any) {
            setError(err?.message ?? "OTP verification failed.");
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

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to resend code.");
                return;
            }

            setMessage("A new verification code has been sent to your email.");
        } catch (err: any) {
            setError(err?.message ?? "Failed to resend code.");
        } finally {
            setResending(false);
        }
    }

    return (
        <div>
            <h1>OTP Verification</h1>
            <p>Enter the 6-digit code sent to your email.</p>

            <form onSubmit={handleVerify}>
                <div>
                    <label>Verification Code</label>
                    <input
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