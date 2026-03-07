import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Button from "../components/Button";
import LinkButton from "../components/LinkButton";

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

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleGoogle() {
        setError("");

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const googleEmail = result.user.email;

            if (!googleEmail) {
                await signOut(auth);
                setError("No email found for this Google account.");
                return;
            }

            const res = await fetch("http://localhost:3000/api/auth/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: googleEmail }),
            });

            const data: { message?: string } = await res.json();

            if (!res.ok) {
                await signOut(auth);
                setError(data.message || "Failed to send verification code.");
                return;
            }

            localStorage.setItem("otpEmail", googleEmail);
            navigate("/auth/otp");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Google login failed."));
        }
    }

    function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        void submitLogin();
    }

    async function submitLogin() {
        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);

            if (!auth.currentUser?.emailVerified) {
                await signOut(auth);
                setError("Please verify your email before logging in. Check your email and click the verification link.");
                return;
            }

            const res = await fetch("http://localhost:3000/api/auth/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data: { message?: string } = await res.json();

            if (!res.ok) {
                await signOut(auth);
                setError(data.message || "Failed to send verification code.");
                return;
            }

            localStorage.setItem("otpEmail", email);
            navigate("/auth/otp");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Login failed."));
        }
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
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
                onClick={() => {
                    navigate("/auth/forgot-password");
                }}
            />

            <LinkButton
                text="Don't have an account yet?"
                onClick={() => {
                    navigate("/auth/signup");
                }}
            />
        </div>
    );
}