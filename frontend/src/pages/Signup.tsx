import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { auth, db } from "@/firebase/firebase";
import { Button } from "@/components/ui/button";
import PopupWindow from "@/components/PopupWindow";
import surveyImage from "../assets/Survey.png";

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

    if (
      !firstName ||
      !lastName ||
      !dob ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const account = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
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
        <main className="h-screen overflow-hidden bg-background text-foreground">
            {showSuccessPopup && (
                <PopupWindow
                    text={
                        <>
                            <p className="text-xl font-bold">
                                New account created successfully!
                            </p>
                            <p className="mt-2 text-base font-normal">
                                Check your email and click the verification link to authenticate your account.
                            </p>
                        </>
                    }
                    firstButtonText="Go back to homepage"
                    onFirstClick={() => navigate("/")}
                />
            )}

            <section className="mx-auto grid h-full max-w-7xl border border-border bg-background md:grid-cols-[1fr_280px]">
                <div className="flex items-center justify-center px-8 py-10 md:px-16">
                    <div className="w-full max-w-md">
                        <div className="mb-6 text-center">
                            <h1 className="text-3xl font-semibold tracking-wide">
                                Sign Up
                            </h1>

                            <p className="mt-3 text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/auth/login")}
                                    className="font-medium text-foreground underline underline-offset-4"
                                >
                                    Click here to Login
                                </button>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="firstName"
                                        className="block text-left text-base font-medium"
                                    >
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        type="text"
                                        className="h-12 w-full border-0 border-b border-border bg-transparent px-0 text-base outline-none ring-0 placeholder:text-muted-foreground focus:border-foreground"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="lastName"
                                        className="block text-left text-base font-medium"
                                    >
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        type="text"
                                        className="h-12 w-full border-0 border-b border-border bg-transparent px-0 text-base outline-none ring-0 placeholder:text-muted-foreground focus:border-foreground"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="dob"
                                    className="block text-left text-base font-medium"
                                >
                                    Date of Birth
                                </label>
                                <input
                                    id="dob"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    type="date"
                                    className="h-12 w-full border-0 border-b border-border bg-transparent px-0 text-base outline-none ring-0 focus:border-foreground"
                                />
                            </div>

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
                                        type={showPasswords ? "text" : "password"}
                                        className="h-12 w-full border-0 border-b border-border bg-transparent px-0 pr-10 text-base outline-none ring-0 placeholder:text-muted-foreground focus:border-foreground"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords((prev) => !prev)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                                    >
                                        {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-left text-base font-medium"
                                >
                                    Confirm your password
                                </label>

                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        type={showPasswords ? "text" : "password"}
                                        className="h-12 w-full border-0 border-b border-border bg-transparent px-0 pr-10 text-base outline-none ring-0 placeholder:text-muted-foreground focus:border-foreground"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords((prev) => !prev)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                                    >
                                        {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="mt-2 text-center text-sm font-medium text-red-500">
                                    {error}
                                </p>
                            )}

                            <div className="flex items-center justify-center gap-4 pb-2 pt-2">
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
                                    Sign Up
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="grid h-full grid-rows-[1fr_1.4fr] border-l border-border">
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
            </section>
        </main>
    );
}
