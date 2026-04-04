import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

type PopupWindowProps = {
    text: ReactNode;
    firstButtonText: string;
    onFirstClick: () => void;
    secondButtonText?: string;
    onSecondClick?: () => void;
};

export default function PopupWindow({
                                        text,
                                        firstButtonText,
                                        onFirstClick,
                                        secondButtonText,
                                        onSecondClick,
                                    }: Readonly<PopupWindowProps>) {
    const hasSecondButton = Boolean(secondButtonText && onSecondClick);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-lg">
                <div className="text-center text-foreground">
                    {text}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                    <Button
                        type="button"
                        onClick={onFirstClick}
                        className={
                            hasSecondButton
                                ? "min-w-[140px] rounded-full transition-colors duration-200 hover:opacity-90"
                                : "min-w-[240px] rounded-full transition-colors duration-200 hover:opacity-90"
                        }
                    >
                        {firstButtonText}
                    </Button>

                    {hasSecondButton && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onSecondClick}
                            className="min-w-[140px] rounded-full transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                        >
                            {secondButtonText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}