interface ButtonProps {
    name: string;
    onClick: () => void;
    className?: string; // useful for css button design
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}

export default function Button({name, className, onClick, type , disabled = false}: Readonly<ButtonProps>) {
    return (
        <button type={type} className={className} onClick={onClick} disabled={disabled}>
            {name}
        </button>
    );
}