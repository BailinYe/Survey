import { twMerge } from "tailwind-merge";
import {ReactNode} from "react";

type CardProps = {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

const Card = ({ children, className, onClick }: CardProps) => {
    return (
        <div
            onClick={onClick}
            className={twMerge(
                "w-full max-w-md rounded-lg bg-white p-6 shadow-md",
                onClick && "cursor-pointer",
                className,
            )}
        >
            {children}
        </div>
    );
};

export default Card;

