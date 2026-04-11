import { Outlet } from "react-router-dom";
import Logo from "@/components/common/Logo";

export default function RespondSurveyLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Mobile Topbar */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 px-4 py-4 backdrop-blur lg:hidden">
                <div className="flex items-center justify-between gap-3">
                    <div className="rounded-[22px] border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                        <Logo className="h-auto w-28" />
                    </div>

                    <a
                        href="/"
                        target="_blank"
                        className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                    >
                        Learn more
                    </a>
                </div>
            </header>

            <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-border bg-sidebar text-sidebar-foreground lg:flex">
                <div className="flex h-full w-full flex-col px-5 py-5">
                    <div className="cursor-pointer rounded-[28px] border border-border/70 bg-card/60 px-4 py-5 shadow-sm backdrop-blur">
                        <div className="flex items-center justify-center">
                            <Logo className="h-auto w-48" />
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between pt-6">
                        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
                            <div className="h-20 bg-gradient-to-br from-primary/12 via-primary/6 to-transparent" />

                            <div className="px-6 pb-6 pt-5 text-center">
                                <div className="mb-3 inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                    Survey response
                                </div>

                                <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
                                    Answer this survey
                                </h1>

                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    We only collect the data submitted through this survey and do not collect personal information unless the survey specifically asks for it.
                                </p>

                                <div className="mt-5 rounded-2xl border border-border bg-background/70 px-4 py-4 text-left">
                                    <p className="text-sm font-medium text-card-foreground">
                                        Want to create your own survey?
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Build, publish, and manage surveys in one place.
                                    </p>

                                    <a
                                        href="/"
                                        target="_blank"
                                        className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                                    >
                                        Learn more
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <div className="rounded-[24px] border border-border bg-card px-4 py-4 shadow-sm">
                                <p className="text-sm font-medium text-card-foreground">Quick access</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    You can complete this survey directly, without signing in.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 lg:ml-72">
                <Outlet />
            </main>
        </div>
    );
}