import TopNavbar from "@/components/layout/TopNavbar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import PopupWindow from "@/components/PopupWindow";
import { Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();

    async function handleLogout() {
        setShowLogoutConfirm(true);
    }

    async function confirmLogout() {
        try {
            await signOut(auth);
            localStorage.removeItem("otpEmail");
            setShowLogoutConfirm(false);
            navigate("/auth/login");
        } catch (err) {
            console.error("Logout failed:", err);
            setShowLogoutConfirm(false);
        }
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            <TopNavbar handleLogout={handleLogout} />
            <LeftSidebar handleLogout={handleLogout} />

            <main className="flex-1 p-6">
                <Outlet />
            </main>

            {showLogoutConfirm && (
                <PopupWindow
                    text={
                        <div>
                            <p className="text-lg font-semibold mb-2">Confirm Logout</p>
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to logout?
                            </p>
                        </div>
                    }
                    firstButtonText="Confirm"
                    onFirstClick={confirmLogout}
                    secondButtonText="Cancel"
                    onSecondClick={() => setShowLogoutConfirm(false)}
                />
            )}
        </div>
    );
}