import Logo from "@/components/common/Logo";
import Avatar from "@/components/common/Avatar";
import {Button} from "@/components/ui/button";
import {LogOut} from "lucide-react";

export default function TopNavbar( {handleLogout}) {



    return (
        <>
            {/* Top Navbar - Mobile Only */}
            <div className="w-full lg:hidden flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-white">
                <Logo className="h-10" />
                <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10" />
                    <Button variant="destructive" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </>
    )
}