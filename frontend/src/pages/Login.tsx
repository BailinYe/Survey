import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import surveyImage from "@/assets/Survey.png";
import googleLogo from "@/assets/Google.png";

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

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
                            >
                                <img
                                    src={googleLogo}
                                    alt="Google logo"
                                    className="h-5 w-5 object-contain"
                                />
                                <span>Sign in with Google</span>
                            </Button>

                            <p className="mt-4 text-center text-sm text-muted-foreground">
                                or Continue with email
                            </p>
                        </div>

                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-left text-base font-medium"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder=""
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
                                        type={showPassword ? "text" : "password"}
                                        placeholder=""
                                        className="h-12 w-full border-0 border-b border-border bg-transparent px-0 pr-10 text-base outline-none ring-0 placeholder:text-muted-foreground focus:border-foreground"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        aria-label={
                                            showPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

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