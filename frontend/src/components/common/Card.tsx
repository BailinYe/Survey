import { twMerge } from "tailwind-merge";
import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void | Promise<void>;
}

const Card = ({ children, className, onClick }: CardProps) => {
    return (
        <div
            className={twMerge(
                `w-full max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground shadow-md ${className || ""}`
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;