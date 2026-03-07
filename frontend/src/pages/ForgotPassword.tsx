import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
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

        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            setError("Please enter your email.");
            return;
        }

        // Where the user should land after completing reset
        // Make sure the domain is in Firebase Auth -> Authorized domains
        const actionCodeSettings = {
            url: `${window.location.origin}/auth/login`,
            handleCodeInApp: false,
        };

        try {
            // 1) Check Firestore `accounts` collection (as you requested)
            try {
                const q = query(
                    collection(db, "accounts"),
                    where("email", "==", normalizedEmail),
                    limit(1)
                );
                const snap = await getDocs(q);

                if (snap.empty) {
                    setError("No account found with this email.");
                    return;
                }
            } catch (firestoreErr: any) {
                // If Firestore rules block this (permission-denied), fallback to Auth check
                // This keeps your feature working even with secure Firestore rules.
                const code = firestoreErr?.code ?? "";
                if (code !== "permission-denied") throw firestoreErr;

                const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
                if (methods.length === 0) {
                    setError("No account found with this email.");
                    return;
                }
            }

            // 2) Send reset email (Firebase handles the email + reset page)
            await sendPasswordResetEmail(auth, normalizedEmail, actionCodeSettings);

            setSuccessMsg(
                "Password reset email sent. Please check your inbox (and spam). Redirecting to Login..."
            );

            setTimeout(() => navigate("/auth/login"), 3000);
        } catch (err: any) {
            const code = err?.code ?? "";

            if (code === "auth/invalid-email") setError("Invalid email format.");
            else if (code === "auth/too-many-requests")
                setError("Too many requests. Please try again later.");
            else setError(err?.message ?? "Failed to send password reset email.");
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