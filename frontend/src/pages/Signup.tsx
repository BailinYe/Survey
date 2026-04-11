import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { auth, db } from "@/firebase/firebase";
import { Button } from "@/components/ui/button";
import PopupWindow from "@/components/PopupWindow";
import Logo from "@/components/common/Logo";

function getErrorMessage(
    error: unknown,
    fallback = "Signup failed."
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

export default function Signup() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    function handleSubmit(e: SyntheticEvent) {
        e.preventDefault();
        void submitSignup();
    }

    async function submitSignup() {
        setError("");
        setShowSuccessPopup(false);

        if (!firstName || !lastName || !dob || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const account = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(account.user);

            await setDoc(doc(db, "accounts", account.user.uid), {
                uid: account.user.uid,
                firstName,
                lastName,
                dob,
                email,
                createdAt: serverTimestamp(),
            });

            setShowSuccessPopup(true);
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Signup failed.");

            if (message.includes("auth/email-already-in-use")) {
                setError("This email is already in use. Please use another one.");
                return;
            }

            if (message.includes("auth/invalid-email")) {
                setError("Please enter a valid email address.");
                return;
            }

            if (message.includes("auth/weak-password")) {
                setError("Password is too weak. Please choose a stronger password.");
                return;
            }

            setError(message);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-4 text-foreground md:px-6 md:py-6 lg:px-8">
            {showSuccessPopup && (
                <PopupWindow
                    text={
                        <>
                            <p className="text-xl font-bold">New account created successfully!</p>
                            <p className="mt-2 text-base font-normal">
                                Check your email and click the verification link to authenticate your account.
                            </p>
                        </>
                    }
                    firstButtonText="Go back to homepage"
                    onFirstClick={() => navigate("/")}
                />
            )}

            <section className="mx-auto w-full max-w-7xl rounded-[32px] border border-border bg-background shadow-sm">
                <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="hidden border-r border-border lg:flex lg:flex-col lg:justify-between lg:p-10">
                        <div>
                            <div className="inline-flex rounded-[24px] border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                                <Logo className="h-auto w-36" />
                            </div>

                            <div className="mt-10 max-w-md">
                                <p className="mb-3 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                    Create account
                                </p>

                                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                                    Start building and managing surveys in one place
                                </h1>

                                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                    Create an account to design surveys, publish them, and review results through a clean dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="grid max-w-md grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Create</p>
                                <p className="mt-1 text-sm font-semibold">Custom surveys</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Publish</p>
                                <p className="mt-1 text-sm font-semibold">In seconds</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Track</p>
                                <p className="mt-1 text-sm font-semibold">Responses</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-xs text-muted-foreground">Review</p>
                                <p className="mt-1 text-sm font-semibold">Analytics</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
                        <div className="mb-8 lg:hidden">
                            <div className="inline-flex rounded-[24px] border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                                <Logo className="h-auto w-32" />
                            </div>
                        </div>

                        <div className="mx-auto w-full max-w-md">
                            <div className="mb-8">
                                <p className="mb-3 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                    Account setup
                                </p>

                                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                    Create your account
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    Already have one?{" "}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/auth/login")}
                                        className="font-medium text-foreground underline underline-offset-4"
                                    >
                                        Log in here
                                    </button>
                                </p>
                            </div>

                            <div className="rounded-[28px] border border-border bg-card px-5 py-5 shadow-sm sm:px-6 sm:py-6">
                                <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label htmlFor="firstName" className="block text-left text-sm font-medium">
                                                First Name
                                            </label>
                                            <input
                                                id="firstName"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                type="text"
                                                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition focus:border-ring"
                                                placeholder="Enter your first name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="lastName" className="block text-left text-sm font-medium">
                                                Last Name
                                            </label>
                                            <input
                                                id="lastName"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                type="text"
                                                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition focus:border-ring"
                                                placeholder="Enter your last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="dob" className="block text-left text-sm font-medium">
                                            Date of Birth
                                        </label>
                                        <input
                                            id="dob"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            type="date"
                                            className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition focus:border-ring dark:[color-scheme:dark]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-left text-sm font-medium">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            name="signup-email"
                                            type="email"
                                            autoComplete="new-email"
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
                                                type={showPasswords ? "text" : "password"}
                                                className="h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-base outline-none transition focus:border-ring"
                                                name="signup-password"
                                                autoComplete="new-password"
                                                placeholder="Create a password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords((prev) => !prev)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                                            >
                                                {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="block text-left text-sm font-medium">
                                            Confirm Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                type={showPasswords ? "text" : "password"}
                                                className="h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-base outline-none transition focus:border-ring"
                                                placeholder="Confirm your password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords((prev) => !prev)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                                            >
                                                {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="rounded-xl border border-red-400/50 bg-red-100 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                            {error}
                                        </div>
                                    )}

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
                                            Sign Up
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