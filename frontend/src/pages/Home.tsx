import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import surveyImage from "@/assets/Survey-3.png";
import Logo from "@/components/common/Logo";
import { ArrowRight } from "lucide-react";

export default function Home() {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen bg-background px-4 py-4 text-foreground md:px-3 md:py-3 lg:px-8">
            <section className="mx-auto grid max-w-7xl overflow-hidden rounded-[32px] border border-border bg-background shadow-sm md:min-h-[calc(100vh-1.5rem)] md:grid-cols-2">
                <div className="relative flex flex-col justify-between px-8 py-8 md:px-10 md:py-10 lg:px-14 lg:py-14">
                    <div className="absolute left-0 top-0 h-40 w-40 rounded-br-[48px] bg-primary/5 blur-2xl" />

                    <div className="relative z-10">
                        <div className="inline-flex rounded-[24px] border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                            <Logo className="h-auto w-32 md:w-36" />
                        </div>
                    </div>

                    <div className="relative z-10 py-10 md:py-0">
                        <p className="mb-4 inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                            Survey platform
                        </p>

                        <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                            Create, publish, and manage surveys
                        </h1>

                        <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground md:text-base">
                            Build surveys quickly, share them with respondents, and review results in a clean and modern dashboard design just for you.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <Button
                                type="button"
                                size="lg"
                                className="group rounded-full px-7"
                                onClick={() => navigate("/auth/login")}
                            >
                                Login
                                <span className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/15">
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
                            </Button>

                            <Button
                                type="button"
                                size="lg"
                                variant="outline"
                                className="rounded-full border-border bg-card px-7 hover:bg-accent hover:text-accent-foreground"
                                onClick={() => navigate("/auth/signup")}
                            >
                                Sign Up
                            </Button>
                        </div>
                    </div>

                    <div className="relative z-10 mt-10 space-y-4">
                        <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                                <p className="text-xs text-muted-foreground">Fast</p>
                                <p className="mt-1 text-sm font-semibold">Setup</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                                <p className="text-xs text-muted-foreground">Easy</p>
                                <p className="mt-1 text-sm font-semibold">Sharing</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                                <p className="text-xs text-muted-foreground">Clear</p>
                                <p className="mt-1 text-sm font-semibold">Results</p>
                            </div>
                        </div>

                        <div className="max-w-xl rounded-[24px] border border-border bg-card px-5 py-4 shadow-sm">
                            <p className="text-sm font-semibold text-card-foreground">
                                Everything you need in one place
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Create custom questions, organize responses, track survey activity, and access analytics from a single platform built for both survey creators and respondents.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative min-h-[320px] border-t border-border md:min-h-full md:border-l md:border-t-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                    <img
                        src={surveyImage}
                        alt="Survey illustration"
                        className="h-full w-full object-cover"
                    />
                </div>
            </section>
        </main>
    );
}