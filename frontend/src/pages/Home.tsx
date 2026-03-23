import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import surveyImage from "@/assets/Survey.png";

export default function Home() {
  const navigate = useNavigate();

    return (
        <main className="h-screen overflow-hidden bg-background text-foreground px-6 py-4 md:px-10 md:py-6 lg:px-14">
            <section className="mx-auto grid h-full max-w-7xl overflow-hidden rounded-none border border-border bg-background md:grid-cols-2">
                <div className="flex flex-col items-center justify-center px-8 py-12 text-center md:px-12 lg:px-16">
                    <div className="mb-10 flex w-full max-w-md flex-col items-center">
                        <div className="flex h-40 w-64 items-center justify-center border-2 border-dashed border-border bg-muted/20 text-lg font-medium text-muted-foreground">
                            Website&apos;s logo
                        </div>

                        <h1 className="mt-6 text-3xl font-semibold tracking-wide md:text-4xl">
                            Website&apos;s name
                        </h1>
                    </div>

                    <Separator className="mb-10 w-full max-w-md" />

                    <div className="max-w-md space-y-4">
                        <h2 className="text-2xl font-semibold italic tracking-wide">
                            Lorem Ipsum
                        </h2>

                        <p className="text-sm leading-7 text-muted-foreground md:text-base">
                            Lorem ipsum, lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
                        </p>
                    </div>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Button
                            type="button"
                            size="lg"
                            className="min-w-[140px] rounded-full px-8 transition-colors duration-200 hover:opacity-90"
                            onClick={() => navigate("/auth/login")}
                        >
                            Login
                        </Button>

                        <Button
                            type="button"
                            size="lg"
                            className="min-w-[140px] rounded-full bg-black px-8 text-white transition-colors duration-200 hover:bg-zinc-800"
                            onClick={() => navigate("/auth/signup")}
                        >
                            Sign Up
                        </Button>
                    </div>
                </div>

                <div
                    className="h-full min-h-0 border-t border-border bg-center bg-cover bg-no-repeat md:border-t-0 md:border-l"
                    style={{ backgroundImage: `url(${surveyImage})` }}
                />
            </section>
        </main>
    );
}
