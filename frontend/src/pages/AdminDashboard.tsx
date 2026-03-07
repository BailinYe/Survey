import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Button from "../components/Button";

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
            <h1>Welcome to the Admin Dashboard page</h1>
            <Button name="Logout" onClick={handleLogout} />
        </div>
    );
}