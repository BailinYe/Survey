import Logo from "@/assets/logo_3.png";

import Avatar from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type TopNavbarProps = {
    handleLogout: () => void;
}

export default function TopNavbar({ handleLogout }: TopNavbarProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const showBackToDashboard =
        location.pathname.startsWith("/admin-dashboard/surveys/new") ||
        location.pathname.includes("/analytics") ||
        location.pathname.includes("/edit");

    return (
        <>
            {/* Top Navbar - Mobile Only */}
            <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-border bg-background px-6 py-4 lg:hidden">
                <div className="flex items-center gap-3">
                    <img src={Logo} alt="Logo" className="h-auto w-40" />
                </div>

                <div className="flex items-center gap-4">
                    {showBackToDashboard && (













                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            onClick={() => navigate("/admin-dashboard")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}

                    <Avatar className="h-10 w-10" />

                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>
        </>
    );
}