import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { auth } from "@/firebase/firebase";
import { Button } from "@/components/ui/button";
import googleLogo from "@/assets/Google.png";
import Logo from "@/components/common/Logo";

function getErrorMessage(
    error: unknown,
    fallback = "Something went wrong.",
): string {
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
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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

            const res = await fetch(`${apiUrl}/api/auth/send-otp`, {
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

    function handleSubmit(e: SyntheticEvent) {
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await user.reload();

            if (!user.emailVerified) {
                await signOut(auth);
                setError("Account not authenticated. Please check your email for the authentication link.");
                return;
            }

            const res = await fetch(`${apiUrl}/api/auth/send-otp`, {
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
            const message = getErrorMessage(err, "Login failed.");

            if (message.includes("auth/user-not-found")) {
                setError("User not found. Please create a new account.");
                return;
            }

            if (
                message.includes("auth/invalid-credential") ||
                message.includes("auth/wrong-password") ||
                message.includes("auth/invalid-email")
            ) {
                setError("Incorrect email or password. Please try again.");
                return;
            }

            if (message.includes("auth/too-many-requests")) {
                setError("Too many failed attempts. Please wait a moment and try again.");
                return;
            }

            setError(message);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-4 text-foreground">
            <section className="mx-auto w-full max-w-7xl rounded-[32px] border border-border bg-background shadow-sm">
                <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="hidden border-r border-border lg:flex lg:flex-col lg:justify-between lg:p-10">
                        <div>
                            <div className="inline-flex rounded-[24px] border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                                <Logo className="h-auto w-36" />
                            </div>

                            <div className="mt-10 max-w-md">
                                <p className="mb-3 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                    Welcome back
                                </p>

                                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                                    Login to continue managing your surveys
                                </h1>

                                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                    Access your dashboard, create surveys, publish them, and review responses in one place.
                                </p>
                            </div>
                        </div>

                        <div className="grid max-w-md grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Fast</p>
                                <p className="mt-1 text-sm font-semibold">Survey creation</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Clear</p>
                                <p className="mt-1 text-sm font-semibold">Analytics</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Easy</p>
                                <p className="mt-1 text-sm font-semibold">Sharing</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Simple</p>
                                <p className="mt-1 text-sm font-semibold">Management</p>
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
                                    Account access
                                </p>

                                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                    Login to your account
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    Don&apos;t have one yet?{" "}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/auth/signup")}
                                        className="font-medium text-foreground underline underline-offset-4"
                                    >
                                        Sign Up
                                    </button>
                                </p>
                            </div>

                            <div className="rounded-[28px] border border-border bg-card px-5 py-5 shadow-sm sm:px-6 sm:py-6">
                                <div className="mb-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 w-full justify-center gap-3 rounded-full bg-background"
                                        onClick={handleGoogle}
                                    >
                                        <img
                                            src={googleLogo}
                                            alt="Google logo"
                                            className="h-5 w-5 object-contain"
                                        />
                                        <span>Login with Google</span>
                                    </Button>

                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-border" />
                                        <p className="text-sm text-muted-foreground">or continue with email</p>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
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

                                    <div className="space-y-2">
                                        <label htmlFor="password" className="block text-left text-sm font-medium">
                                            Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                type={showPassword ? "text" : "password"}
                                                className="h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-base outline-none transition focus:border-ring"
                                                placeholder="Enter your password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="rounded-xl border border-red-400/50 bg-red-100 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => navigate("/auth/forgot-password")}
                                            className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-12 w-12 rounded-full"
                                            onClick={() => navigate("/")}
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </Button>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="min-w-[250px] rounded-full px-8"
                                        >
                                            Login
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