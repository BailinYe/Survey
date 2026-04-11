import logoLight from "@/assets/logo_2.png";
import logoDark from "@/assets/logo_2w.png";
import { useTheme } from "@/context/ThemeContext";

interface LogoProps {
    className?: string;
}

export default function Logo({ className }: LogoProps) {

    const { theme } = useTheme();

    return (
        <img

            src={theme === "dark" ? logoDark : logoLight}
            alt="SparrowSurvey logo"
            className={className}
        />
    );
}