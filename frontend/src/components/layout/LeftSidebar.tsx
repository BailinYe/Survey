import Logo from "@/components/common/Logo";
import Avatar from "@/components/common/Avatar";
import {Button} from "@/components/ui/button";
import {ArrowLeft, LogOut} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";


export default function LeftSidebar({handleLogout}) {

    const location = useLocation();
    const navigate = useNavigate();

    // const isCreateSurveyPage = location.pathname.includes("admin-dashboard/surveys/new");
    // const isResultsPage = location.pathname.includes("admin-dashboard/results");

    const showBackToDashboard =
        location.pathname.startsWith("/admin-dashboard/surveys/new") ||
        location.pathname.startsWith("/admin-dashboard/results");

    return (
        <>
            {/* Left Sidebar - Desktop Only */}
            <div className="hidden lg:flex flex-col w-64 h-screen items-center gap-64">
                <Logo className="self-center ml-12 mt-6" />

                <div className="flex flex-col items-center gap-14 mt-16 border-t-gray-200 ">
                    {!showBackToDashboard && (
                        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
                            Hi User!
                        </h1>
                    )}
                    <Avatar className="w-27 h-27" />
                    <Button
                        variant="outline"
                        className="rounded-full px-6"
                        onClick={handleLogout}>
                        Logout
                    </Button>

                    {/*Show back to Dashboard button only on these paths*/}
                    {showBackToDashboard && (
                        <Button
                            variant="outline"
                            className="rounded-full "
                            onClick={() => navigate("/admin-dashboard")}>
                            <ArrowLeft />
                            Back to Dashboard
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}