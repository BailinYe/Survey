import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Button from "../components/Button";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!email) {
            setError("Please enter your email.");
            return;
        }

        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);

            if (methods.length === 0) {
                setError("No account found with this email.");
                return;
            }

            await sendPasswordResetEmail(auth, email);

            setSuccessMsg(
                "Password reset email sent. Please check your inbox. You will be redirected to Login shortly..."
            );

            setTimeout(() => {
                navigate("/auth/login");
            }, 3000);
        } catch (err: any) {
            setError(err?.message ?? "Failed to send password reset email.");
        }
    }

    return (
        <div>
            <h1>Forgot Password</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {successMsg && <p>{successMsg}</p>}
                {error && <p>{error}</p>}

                <Button name="Next" type="submit" onClick={() => {}} />
            </form>
        </div>
    );
}