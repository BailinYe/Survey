import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { Button } from "../components/ui/button";

import { LogOut, Plus, Settings } from "lucide-react";


export default function AdminDashboard() {
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await signOut(auth);
            localStorage.removeItem("otpEmail");
            navigate("/auth/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }

    return (
        <div>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0  mb-7">
                Admin Dashboard
            </h2>
            <Button variant="destructive" onClick={handleLogout}>
                <LogOut/> Logout
            </Button>
        </div>

    );
}