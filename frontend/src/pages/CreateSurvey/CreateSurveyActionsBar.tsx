import { Button } from "@/components/ui/button";
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";

/**
 * Top action row for the Create/Edit Survey page
 * Keeps index.tsx clean by extracting the "Save" + "Publish" buttons and their disable logic.
 */
type Props = {
    // Current survey status (New/Active/Closed)
    status?: SurveyStatus;

    // Whether the editor is currently saving or loading
    isSaving: boolean;
    isLoadingSurvey: boolean;

    // Whether the current draft is empty (optional UX guard)
    isEmptyDraft: boolean;

    // Whether a surveyId exists yet (draft created)
    hasSurveyId: boolean;

    // Actions
    onSave: () => void | Promise<void>;
    onPublish: () => void | Promise<void>;
};

export default function CreateSurveyActionsBar(props: Props) {
    const {
        status,
        isSaving,
        isLoadingSurvey,
        isEmptyDraft,
        hasSurveyId,
        onSave,
        onPublish,
    } = props;

    const isEditableDraft = !status || status === SurveyStatus.New;

    return (
        <div className="flex justify-end gap-3">
            {/* Save draft */}
            <Button
                type="button"
                variant="outline"
                className="rounded-full px-10"
                onClick={onSave}
                disabled={isSaving || isEmptyDraft || isLoadingSurvey || !isEditableDraft}
                title={!isEditableDraft ? "Only drafts can be edited" : undefined}
            >
                {isSaving ? "Saving..." : "Save"}
            </Button>

            {/* Publish (auto-saves inside handler, but requires an id after save) */}
            <Button
                type="button"
                className="rounded-full bg-blue-600 px-10 text-white hover:bg-blue-700"
                onClick={onPublish}
                disabled={isSaving || isLoadingSurvey || !hasSurveyId}
                title={!hasSurveyId ? "Save first to create a draft" : undefined}
            >
                Publish
            </Button>
        </div>
    );
}