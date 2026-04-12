import TopNavbar from "@/components/layout/TopNavbar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import PopupWindow from "@/components/PopupWindow";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { SurveyDTO as Survey, SurveyStatus } from "@shared/models/dtos";

type UserProfile = {
    firstName?: string;
    name?: string;
};

export type AdminLayoutContext = {
    surveys: Survey[];
    isLoading: boolean;
    error: string;
    refreshSurveys: () => Promise<void>;
    setBackToDashboardHandler: (handler: (() => void) | null) => void;
};

export default function AdminLayout() {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [backToDashboardHandler, setBackToDashboardHandler] = useState<(() => void) | null>(null);

    const fetchSurveys = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const user = auth.currentUser;
            if (!user) {
                throw new Error("User is not authenticated.");
            }

            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
            const token = await user.getIdToken();

            const res = await fetch(`${apiUrl}/api/surveys`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch surveys: ${res.statusText}`);
            }

            const data: Survey[] = await res.json();
            setSurveys(data || []);
        } catch (err) {
            console.error("Failed to fetch surveys:", err);
            setError(err instanceof Error ? err.message : "Failed to load surveys");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
                const token = await user.getIdToken();

                const res = await fetch(`${apiUrl}/api/accounts/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch user profile");
                }

                const data: UserProfile = await res.json();
                setUserProfile(data);
            } catch (err) {
                console.error("Failed to fetch user profile:", err);
            }
        }

        void fetchUserProfile();
    }, []);

    useEffect(() => {
        void fetchSurveys();
    }, [fetchSurveys]);

    useEffect(() => {
        const isSurveyEditorPage =
            location.pathname.startsWith("/admin-dashboard/surveys/new") ||
            location.pathname.includes("/edit");

        if (!isSurveyEditorPage && backToDashboardHandler) {
            setBackToDashboardHandler(null);
        }
    }, [location.pathname, backToDashboardHandler]);

    function handleLogout() {
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

    const sidebarStats = {
        totalSurveys: surveys.length,
        totalAnswers: surveys.reduce((sum, survey) => sum + (survey.answerCount || 0), 0),
        activeSurveys: surveys.filter((survey) => survey.status === SurveyStatus.Active).length,
        totalShares: surveys.reduce((sum, survey) => sum + (survey.sharedCount || 0), 0),
    };

    const firstName = useMemo(() => {
        const rawFirstName =
            typeof userProfile?.firstName === "string" ? userProfile.firstName.trim() : "";

        if (rawFirstName) {
            return rawFirstName;
        }

        let rawName = "";

        if (typeof userProfile?.name === "string") {
            rawName = userProfile.name.trim();
        } else if (typeof auth.currentUser?.displayName === "string") {
            rawName = auth.currentUser.displayName.trim();
        }

        if (rawName) {
            return rawName.split(/\s+/)[0];
        }

        return "";
    }, [userProfile]);

    return (
        <div className="min-h-screen bg-background">
            <TopNavbar handleLogout={handleLogout} />
            <LeftSidebar
                handleLogout={handleLogout}
                nameUser={firstName}
                stats={sidebarStats}
                onBackToDashboard={backToDashboardHandler ?? undefined}
            />

            <main className="flex-1 px-6 py-6 pt-2 sm:pt-2 lg:ml-72 lg:pt-6">
                <Toaster />
                <Outlet
                    context={{
                        surveys,
                        isLoading,
                        error,
                        refreshSurveys: fetchSurveys,
                        setBackToDashboardHandler,
                    }}
                />
            </main>

            {showLogoutConfirm && (
                <PopupWindow
                    text={
                        <div>
                            <p className="mb-2 text-lg font-semibold">Confirm Logout</p>
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