import Logo from "@/assets/logo_3.png";
import Avatar from "@/components/common/Avatar";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type LeftSidebarProps = {
    handleLogout: () => void;
}

export default function LeftSidebar({handleLogout} : LeftSidebarProps) {

    const location = useLocation();
    const navigate = useNavigate();

    const showBackToDashboard =
        location.pathname.startsWith("/admin-dashboard/surveys/new") ||
        location.pathname.includes("/analytics") ||
        location.pathname.includes("/edit");

    return (
        <>
            {/* Left Sidebar - Desktop Only */}
            <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col items-center border-r border-border bg-background lg:flex">
                <div className="flex h-full w-full flex-col items-center px-6 py-6">
                    <img src={Logo} alt="Logo" className="h-auto w-80" />


                    <div className="mt-16 flex flex-1 flex-col items-center gap-10">
                        {!showBackToDashboard && (
                            <h1 className="text-3xl font-semibold tracking-tight">
                                Hi User!
                            </h1>
                        )}

                        <Avatar className="h-27 w-27" />

                        <Button
                            variant="outline"
                            className="rounded-full px-6"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>


                        {showBackToDashboard && (
                            <Button
                                variant="outline"
                                className="rounded-full"
                                onClick={() => navigate("/admin-dashboard")}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}