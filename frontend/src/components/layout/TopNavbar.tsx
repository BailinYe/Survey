import Avatar from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/common/ThemeToggle";
import Logo from "@/components/common/Logo";

type TopNavbarProps = {
    handleLogout: () => void;
};

export default function TopNavbar({ handleLogout }: TopNavbarProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const showBackToDashboard =
        location.pathname.startsWith("/admin-dashboard/surveys/new") ||
        location.pathname.includes("/analytics") ||
        location.pathname.includes("/edit");

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 px-4 py-4 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
                <div
                    className="cursor-pointer rounded-[22px] border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur"
                    onClick={() => navigate("/admin-dashboard")}
                >
                    <Logo className="h-auto w-32" />
                </div>

                <div className="flex items-center gap-2">
                    {showBackToDashboard && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-card"
                            onClick={() => navigate("/admin-dashboard")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}

                    <ThemeToggle />

                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                        <Avatar className="h-8 w-8" />
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-card"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}