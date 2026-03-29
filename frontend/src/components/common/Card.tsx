import { twMerge } from "tailwind-merge";

type CardProps = {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
};

const Card = ({ children, className, onClick }: CardProps) => {
    return (
        <div
            className={twMerge(
                "w-full max-w-md rounded-lg bg-white p-6 shadow-md",
                className || "",
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;