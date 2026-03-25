import Logo from "@/components/common/Logo";
import Avatar from "@/components/common/Avatar";
import {Button} from "@/components/ui/button";
import {LogOut} from "lucide-react";


export default function LeftSidebar({handleLogout}) {

    return (
        <>
            {/* Left Sidebar - Desktop Only */}
            <div className="hidden lg:flex flex-col w-64 h-screen items-center gap-64">
                <Logo className="self-center ml-12 mt-6" />
                <div className="flex flex-col items-center gap-14 mt-16 border-t-gray-200 border-t-2">
                    <h1 className="scroll-m-20 border-b text-3xl font-semibold tracking-tight first:mt-0">
                        Hi User!
                    </h1>
                    <Avatar className="w-27 h-27" />
                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>
            </div>
        </>
    );
}