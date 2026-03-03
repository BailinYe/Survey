import Button from "../components/Button.tsx";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Home (placeholder)</h1>
            <p> Intro sentence and images could be designed later for the Home intro page...</p>
            <Button name="Login" type="button" onClick={() => navigate("/auth/login")} />
            <Button name="Sign up" type="button" onClick={() => navigate("/auth/signup")} />

        </div>
    );
}