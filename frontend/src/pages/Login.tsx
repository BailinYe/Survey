import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import Button from "../components/Button";
import LinkButton from "../components/LinkButton";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleGoogle() {
        setError("");
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate("/admin-dashboard");
        } catch (err: any) {
            setError(err?.message ?? "Google login failed.");
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);

            // Block unverified accounts
            if (!auth.currentUser?.emailVerified) {
                await signOut(auth);
                setError("Please verify your email before logging in. Check your email and click the verification link.");
                return;
            }

            // Send OTP email from backend
            const res = await fetch("http://localhost:3000/api/auth/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                await signOut(auth);
                setError(data.message || "Failed to send verification code.");
                return;
            }

            // Save email for OTP page
            localStorage.setItem("otpEmail", email);

            // Go to OTP page
            navigate("/auth/otp");
        } catch (err: any) {
            setError(err?.message ?? "Login failed.");
        }
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                    />
                </div>

                {error && <p>{error}</p>}

                <Button name="Login" type="submit" onClick={() => {}} />
            </form>

            <br />

            <Button name="Continue with Google" onClick={handleGoogle} />

            <LinkButton
                text="Forgot your password?"
                onClick={() => navigate("/auth/forgot-password")}
            />

            <LinkButton
                text="Don't have an account yet?"
                onClick={() => navigate("/auth/signup")}
            />
        </div>
    );
}