import { twMerge } from "tailwind-merge";

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={twMerge(`w-full max-w-md rounded-lg bg-white p-6 shadow-md ${className || ""}`)}>
        {children}
    </div>
  );
}

export default Card;

