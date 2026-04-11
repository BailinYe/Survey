import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";
import { Save, Trash2 } from "lucide-react";
import PopupWindow from "@/components/PopupWindow";

type Props = {
    status?: SurveyStatus;
    isSaving: boolean;
    isLoadingSurvey: boolean;
    isEmptyDraft: boolean;
    hasSurveyId: boolean;
    onSave: () => void | Promise<void>;
    onPublish: () => void | Promise<void>;
    handleDeleteSurvey: () => void | Promise<void>;
};

export default function CreateSurveyActionsBar(props: Props) {
    const [showDeletePopup, setShowDeletePopup] = useState(false);

    const {
        status,
        isSaving,
        isLoadingSurvey,
        isEmptyDraft,
        hasSurveyId,
        onSave,
        onPublish,
        handleDeleteSurvey,
    } = props;

    const isEditableDraft = !status || status === SurveyStatus.New;

    async function confirmDeleteSurvey() {
        setShowDeletePopup(false);
        await handleDeleteSurvey();
    }

    function cancelDeleteSurvey() {
        setShowDeletePopup(false);
    }

    function openDeletePopup() {
        setShowDeletePopup(true);
    }

    return (
        <>
            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="analytics-action-btn analytics-action-danger rounded-full"
                    onClick={openDeletePopup}
                    disabled={isSaving || isLoadingSurvey || !hasSurveyId}
                    title={!hasSurveyId ? "Save first to create a draft" : undefined}
                >
                    <Trash2 className="h-4 w-4" />
                    Delete Survey
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-10"
                    onClick={onSave}
                    disabled={isSaving || isEmptyDraft || isLoadingSurvey || !isEditableDraft}
                    title={!isEditableDraft ? "Only drafts can be edited" : undefined}
                >
                    {isSaving ? (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                        </>
                    )}
                </Button>

                <Button
                    type="button"
                    className="rounded-full bg-primary px-10 text-primary-foreground hover:opacity-90"
                    onClick={onPublish}
                    disabled={isSaving || isLoadingSurvey || !hasSurveyId}
                    title={!hasSurveyId ? "Save first to create a draft" : undefined}
                >
                    Publish
                </Button>
            </div>

            {showDeletePopup && (
                <PopupWindow
                    text={
                        <div>
                            <p className="mb-2 text-lg font-semibold">Delete survey?</p>
                            <p className="text-sm text-muted-foreground">
                                This action cannot be undone.
                            </p>
                        </div>
                    }
                    firstButtonText="Delete"
                    onFirstClick={confirmDeleteSurvey}
                    secondButtonText="Cancel"
                    onSecondClick={cancelDeleteSurvey}
                />
            )}
        </>
    );
}