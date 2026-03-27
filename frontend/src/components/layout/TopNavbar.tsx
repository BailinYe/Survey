// import Logo from "@/components/common/Logo";
// import Avatar from "@/components/common/Avatar";
// import {Button} from "@/components/ui/button";
// import {LogOut} from "lucide-react";
//
// export default function TopNavbar( {handleLogout}) {
//
//
//
//     return (
//         <>
//             {/* Top Navbar - Mobile Only */}
//             <div className="w-full lg:hidden flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-white">
//                 <Logo className="h-10" />
//                 <div className="flex items-center gap-4">
//                     <Avatar className="w-10 h-10" />
//                     <Button variant="destructive" size="sm" onClick={handleLogout}>
//                         <LogOut className="h-4 w-4" />
//                     </Button>
//                 </div>
//             </div>
//         </>
//     )
// }

import Logo from "@/components/common/Logo";
import Avatar from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function TopNavbar({ handleLogout }) {
    const location = useLocation();
    const navigate = useNavigate();

    const showBackToDashboard =
        location.pathname.startsWith("/admin-dashboard/surveys/new") ||
        location.pathname.startsWith("/admin-dashboard/results");

    return (
        <>
            {/* Top Navbar - Mobile Only */}
            <div className="w-full lg:hidden flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                    <Logo className="h-10" />


                </div>

                <div className="flex items-center gap-4">
                    {/* Show back button on mobile in the navbar */}
                    {showBackToDashboard && (
                        <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() => navigate("/admin-dashboard")}>
                            <ArrowLeft />
                        </Button>
                    )}
                    <Avatar className="w-10 h-10" />
                    <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={handleLogout}>
                        <LogOut />
                    </Button>
                </div>
            </div>
        </>
    );
}