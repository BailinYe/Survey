import TopNavbar from "@/components/layout/TopNavbar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { useCallback, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import PopupWindow from "@/components/PopupWindow";
import { Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { SurveyDTO as Survey, SurveyStatus } from "@shared/models/dtos";

export type AdminLayoutContext = {
    surveys: Survey[];
    isLoading: boolean;
    error: string;
    refreshSurveys: () => Promise<void>;
};

export default function AdminLayout() {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();

    const [userProfile, setUserProfile] = useState<any>(null);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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

            const data = await res.json();
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

                const data = await res.json();
                setUserProfile(data);
            } catch (err) {
                console.error("Failed to fetch user profile:", err);
            }
        }

        fetchUserProfile();
    }, []);

    useEffect(() => {
        fetchSurveys();
    }, [fetchSurveys]);

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

    const sidebarStats = {
        totalSurveys: surveys.length,
        totalAnswers: surveys.reduce((sum, survey) => sum + (survey.answerCount || 0), 0),
        activeSurveys: surveys.filter((survey) => survey.status === SurveyStatus.Active).length,
        totalShares: surveys.reduce((sum, survey) => sum + (survey.sharedCount || 0), 0),
    };

    return (
        <div className="min-h-screen bg-background">
            <TopNavbar handleLogout={handleLogout} />
            <LeftSidebar
                handleLogout={handleLogout}
                nameUser={userProfile?.firstName ?? ""}
                stats={sidebarStats}
            />

            <main className="flex-1 px-6 py-6 pt-24 sm:pt-2 lg:ml-72 lg:pt-6">
                <Toaster />
                <Outlet context={{ surveys, isLoading, error, refreshSurveys: fetchSurveys }} />
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