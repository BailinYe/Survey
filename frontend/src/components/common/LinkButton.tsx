interface LinkButtonProps {
    text: string;
    onClick: () => void;
}

export default function LinkButton({ text, onClick }: Readonly<LinkButtonProps>) {
    return (
        <button type="button" onClick={onClick} className="link-button">
            {text}
        </button>
    );
}