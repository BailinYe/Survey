import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import LinkButton from "../components/LinkButton";

export default function Signup() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState(""); // yyyy-mm-dd
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!firstName || !lastName || !dob || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        navigate("/home");
    }

    return (
        <div>
            <h1>Signup</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>First name</label>
                    <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                    />
                </div>

                <div>
                    <label>Last name</label>
                    <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                    />
                </div>

                <div>
                    <label>Date of birth</label>
                    <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" />
                </div>

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
                        placeholder="Password"
                    />
                </div>

                <div>
                    <label>Confirm your password</label>
                    <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password"
                        placeholder="Confirm password"
                    />
                </div>

                {error && <p>{error}</p>}

                <Button name="Sign up" type="submit" onClick={() => {}} />
            </form>

            <Button name="Return to Homepage" type="button" onClick={() => navigate("/")} />

            <LinkButton text="Already have an account?" onClick={() => navigate("/auth/login")} />


        </div>
    );
}