import Avatar from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Sparkles, LayoutDashboard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/common/ThemeToggle";
import Logo from "@/components/common/Logo";

type SidebarStats = {
    totalSurveys: number;
    totalAnswers: number;
    activeSurveys: number;
    totalShares: number;
};

type LeftSidebarProps = Readonly<{
    handleLogout: () => void;
    nameUser: string;
    stats?: SidebarStats;
    onBackToDashboard?: () => void;
}>;

export default function LeftSidebar({
                                        handleLogout,
                                        nameUser,
                                        stats,
                                        onBackToDashboard,
                                    }: LeftSidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const showBackToDashboard =
        location.pathname.startsWith("/admin-dashboard/surveys/new") ||
        location.pathname.includes("/analytics") ||
        location.pathname.includes("/edit");

    function handleBackToDashboardClick() {
        if (onBackToDashboard) {
            onBackToDashboard();
            return;
        }

        navigate("/admin-dashboard");
    }

    const displayName =
        nameUser.charAt(0).toUpperCase() + nameUser.substring(1);

    return (
        <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-border bg-sidebar text-sidebar-foreground lg:flex">
            <div className="flex h-full w-full flex-col px-5 py-5">
                <button
                    type="button"
                    className="rounded-[28px] border border-border/70 bg-card/60 px-4 py-5 shadow-sm backdrop-blur"
                    onClick={() => navigate("/admin-dashboard")}
                >
                    <div className="flex items-center justify-center">
                        <Logo className="h-auto w-48" />
                    </div>
                </button>

                <div className="flex flex-1 flex-col justify-between pt-6">
                    <div className="flex flex-col gap-5">
                        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
                            <div className="h-20 bg-gradient-to-br from-primary/12 via-primary/6 to-transparent" />

                            <div className="-mt-10 px-6 pb-6 text-center">
                                <div className="mb-4 flex justify-center">
                                    <Avatar className="h-24 w-24 border-4 border-card ring-4 ring-muted/70" />
                                </div>

                                {showBackToDashboard ? (
                                    <>
                                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                            <LayoutDashboard className="h-3.5 w-3.5" />
                                            Navigation
                                        </div>

                                        <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
                                            Working on a survey
                                        </h1>

                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                            Return to your dashboard anytime to manage surveys and view overall activity.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Welcome back
                                        </div>

                                        <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
                                            Hi {displayName}!
                                        </h1>

                                        <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                                            <div className="rounded-2xl border border-border bg-background/70 px-3 py-3">
                                                <p className="text-xs text-muted-foreground">Surveys</p>
                                                <p className="mt-1 text-lg font-semibold text-card-foreground">
                                                    {stats?.totalSurveys ?? 0}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-border bg-background/70 px-3 py-3">
                                                <p className="text-xs text-muted-foreground">Answers</p>
                                                <p className="mt-1 text-lg font-semibold text-card-foreground">
                                                    {stats?.totalAnswers ?? 0}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-border bg-background/70 px-3 py-3">
                                                <p className="text-xs text-muted-foreground">Active</p>
                                                <p className="mt-1 text-lg font-semibold text-card-foreground">
                                                    {stats?.activeSurveys ?? 0}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-border bg-background/70 px-3 py-3">
                                                <p className="text-xs text-muted-foreground">Shared</p>
                                                <p className="mt-1 text-lg font-semibold text-card-foreground">
                                                    {stats?.totalShares ?? 0}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {showBackToDashboard && (
                            <Button
                                variant="outline"
                                className="h-11 w-full rounded-full bg-card"
                                onClick={handleBackToDashboardClick}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3 pt-6">
                        <div className="rounded-[24px] border border-border bg-card px-4 py-4 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-card-foreground">Appearance</p>
                                    <p className="text-xs text-muted-foreground">
                                        Switch between light and dark mode
                                    </p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="h-11 w-full rounded-full bg-card"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    );
}