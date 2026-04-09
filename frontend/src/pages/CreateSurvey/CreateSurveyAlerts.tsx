/**
 * Small presentational component for all "status" text:
 * - loading survey, load error, save error, save success
 *
 * Keeps index.tsx from becoming a wall of conditional rendering
 */
type Props = {
    isLoadingSurvey: boolean;
    loadError?: string;
    saveError?: string;
    saveSuccess?: string;
};

export default function CreateSurveyAlerts(props: Props) {
    const { isLoadingSurvey, loadError, saveError, saveSuccess } = props;

    // Render nothing if there's nothing to show
    if (!isLoadingSurvey && !loadError && !saveError && !saveSuccess) return null;

    return (
        <div className="space-y-1">
            {isLoadingSurvey && (
                <p className="text-sm text-muted-foreground">Loading survey…</p>
            )}

            {loadError && (
                <p className="text-sm font-medium text-red-600">{loadError}</p>
            )}

            {saveError && (
                <p className="text-sm font-medium text-red-600">{saveError}</p>
            )}

            {saveSuccess && (
                <p className="text-sm font-medium text-green-700">{saveSuccess}</p>
            )}
        </div>
    );
}