import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import LinkButton from "../components/LinkButton.tsx";

export default function ForgotPassword_step2() {
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Later: update password in Firebase
        navigate("/auth/login");
    }

    return (
        <div>
            <h1>Forgot Password (Step 2)</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>New password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>

                <div>
                    <label>Confirm new password</label>
                    <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                </div>

                {error && <p>{error}</p>}

                <Button name="Reset password" type="submit" onClick={() => {}} />
                <Button name="Return to Login" type="button" onClick={() => navigate("/auth/login")} />
                <Button name="Return to Homepage" type="button" onClick={() => navigate("/")} />

                {/*The two buttons below should look like links (no border or button styling). This could be styles in a separate css file later on...*/}
                <LinkButton text="Don't have an account?" onClick={() => navigate("/auth/signup")} />
            </form>
        </div>
    );
}