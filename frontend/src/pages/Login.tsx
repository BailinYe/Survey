import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import LinkButton from "../components/LinkButton";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleGoogle() {
        // Later: Firebase Google Auth
        navigate("/admin-daasboard");
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Later: Firebase email/password login + send OTP
        navigate("/auth/otp");
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="email@example.com"
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="password"
                    />
                </div>

                <Button name="Login" type="submit" onClick={() => {}} />
            </form>

            <br/>

            <Button name="Continue with Google" onClick={handleGoogle} />

            <LinkButton
                text="Forgot your password?"
                onClick={() => navigate("/auth/forgot-password/step1")}
            />

            <LinkButton text="Don't have an account yet?" onClick={() => navigate("/auth/signup")} />
        </div>
    );
}