import { Outlet } from "react-router-dom";
import Logo from "@/components/common/Logo";

export default function RespondSurveyLayout() {
    return (
        <div className="flex min-h-screen flex-row">
            <div className="hidden w-64 flex-col border-r bg-gray-50 p-6 lg:flex">
                <div className="border-b pb-6">
                    <Logo />
                </div>

                <div className="h-12" />

                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col gap-2 text-center">
                        <p className="text-sm text-muted-foreground">
                            Wanna make your own Survey? Use our tool!
                        </p>
                        <a
                            href="/auth/signup"
                            className="text-sm font-medium text-blue-600 underline hover:text-blue-700"
                        >
                            Learn more
                        </a>
                    </div>
                </div>

                <div className="flex-1" />
            </div>

            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
}