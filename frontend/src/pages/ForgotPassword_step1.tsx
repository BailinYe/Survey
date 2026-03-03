import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import LinkButton from "../components/LinkButton.tsx";

export default function ForgotPassword_step1() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        navigate("/auth/forgot-password/step2");
    }

    return (
        <div>
            <h1>Forgot Password (Step 1)</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <Button name="Next" type="submit" onClick={() => {}} />
                <Button name="Return to Login" type="button" onClick={() => navigate("/auth/login")} />
                <Button name="Return to Homepage" type="button" onClick={() => navigate("/")} />

                {/*The two buttons below should look like links (no border or button styling). This could be styles in a separate css file later on...*/}
                <LinkButton text="Don't have an account?" onClick={() => navigate("/auth/signup")} />
            </form>
        </div>
    );
}