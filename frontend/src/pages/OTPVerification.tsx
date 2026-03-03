import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import LinkButton from "../components/LinkButton";

export default function OtpVerify() {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!code) {
            setError("Please enter the verification code.");
            return;
        }

        // Later: verify OTP with backend
        navigate("/home");
    }

    return (
        <div>
            <h1>OTP Verification</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Verification code</label>
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter code"
                    />
                </div>

                {error && <p>{error}</p>}

                <Button name="Login" type="submit" onClick={() => {}} />
            </form>

            <LinkButton text="Go back to Login" onClick={() => navigate("/auth/login")} />
            <LinkButton text="Go back to Homepage" onClick={() => navigate("/")} />
        </div>
    );
}