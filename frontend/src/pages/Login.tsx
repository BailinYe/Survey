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
import surveyImage from "@/assets/Survey.png";
import googleLogo from "@/assets/Google.png";

function getErrorMessage(
    error: unknown,
    fallback = "Something went wrong."
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
            await signInWithEmailAndPassword(auth, email, password);

            if (!auth.currentUser?.emailVerified) {
                await signOut(auth);
                setError(
                    "Please verify your email before logging in. Check your email and click the verification link."
                );
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
            const message = getErrorMessage(err, "Login failed.");

            if (
                message.includes("auth/invalid-credential") ||
                message.includes("auth/user-not-found") ||
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
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-semibold tracking-wide">
                                Login to your account
                            </h1>

                            <p className="mt-3 text-sm text-muted-foreground">
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

                        <div className="mb-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 w-full justify-center gap-3 rounded-full"
                                onClick={handleGoogle}
                            >
                                <img
                                    src={googleLogo}
                                    alt="Google logo"
                                    className="h-5 w-5 object-contain"
                                />
                                <span>Login with Google</span>
                            </Button>

                            <p className="mt-4 text-center text-sm text-muted-foreground">
                                or Continue with email
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-left text-base font-medium"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    className="h-12 w-full border-0 border-b border-border bg-transparent px-0 text-base outline-none ring-0 placeholder:text-muted-foreground focus:border-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="block text-left text-base font-medium"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        type={showPassword ? "text" : "password"}
                                        className="h-12 w-full border-0 border-b border-border bg-transparent px-0 pr-10 text-base outline-none ring-0 placeholder:text-muted-foreground focus:border-foreground"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="mt-2 text-center text-sm font-medium text-red-500">
                                    {error}
                                </p>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate("/auth/forgot-password")}
                                    className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-4 pt-6">
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
                                    className="min-w-[250px] rounded-full bg-black text-white transition-colors duration-200 hover:bg-zinc-800"
                                >
                                    Login
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}