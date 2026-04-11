export function parseDate(value: unknown): Date | null {
    if (!value) return null;

    if (value instanceof Date) return value;

    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    if (
        typeof value === "object" && "_seconds" in value &&
        typeof (value as { _seconds: unknown })._seconds === "number"
    ) {
        return new Date((value as { _seconds: number })._seconds * 1000);
    }

    return null;
}

export function formatDate(value: unknown, fallback = "N/A"): string {
    const date = parseDate(value);
    return date ? date.toLocaleDateString() : fallback;
}