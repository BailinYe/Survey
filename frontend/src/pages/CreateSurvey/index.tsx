import { QuestionDTO } from "@shared/models/dtos/types/QuestionDTO";
import { Plus } from "lucide-react";

import SurveyHeaderCard from "./SurveyHeaderCard";
import QuestionCard from "./QuestionCard";

import PublishSurveyPopup from "@/components/PublishSurveyPopup";
import PopupWindow from "@/components/PopupWindow";

import CreateSurveyActionsBar from "./CreateSurveyActionsBar";
import CreateSurveyAlerts from "./CreateSurveyAlerts";

import {
    RATING_SCALE_MAX,
    RATING_SCALE_MIN,
    clampInt,
    parseOptionalInt,
} from "./questionFactory";

import { useSurveyEditor } from "./useSurveyEditor";

export default function CreateSurvey() {
    const editor = useSurveyEditor();

    const {
        surveyId,
        status,

        title,
        description,
        expiredAt,
        setTitle,
        setDescription,
        setExpiredAt,

        questions,

        isLoadingSurvey,
        isSaving,

        showPublishPopup,
        setShowPublishPopup,
        showSuccessPopup,
        setShowSuccessPopup,
        showDiscardChangesPopup,

        surveyName,
        isEmptyDraft,

        changeQuestionType,
        deleteQuestion,
        updateQuestion,
        addQuestion,
        openPublish,
        handlePublish,
        handleSave,
        handleDeleteSurvey,
        goBackToDashboard,
        cancelDiscardChanges,
        discardChangesAndLeave,
    } = editor;

    return (
        <>
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 px-3 sm:px-4">
                <CreateSurveyActionsBar
                    status={status}
                    isSaving={isSaving}
                    isLoadingSurvey={isLoadingSurvey}
                    isEmptyDraft={isEmptyDraft}
                    hasSurveyId={Boolean(surveyId)}
                    onSave={handleSave}
                    onPublish={openPublish}
                    handleDeleteSurvey={handleDeleteSurvey}
                />

                <CreateSurveyAlerts isLoadingSurvey={isLoadingSurvey} />

                <SurveyHeaderCard
                    title={title}
                    description={description}
                    setTitle={setTitle}
                    setDescription={setDescription}
                />

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">Survey Expiry</h2>
                        <p className="text-sm text-muted-foreground">
                            Choose the date and time when this survey should automatically close.
                        </p>
                    </div>

                    <div className="max-w-xs">
                        <label htmlFor="expiredAt" className="mb-2 block text-sm font-medium">
                            Expiry date and time
                        </label>
                        <input
                            id="expiredAt"
                            type="datetime-local"
                            value={expiredAt}
                            onChange={(e) => setExpiredAt(e.target.value)}
                            className="w-full appearance-none rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring dark:[color-scheme:dark]"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {questions.map((q: QuestionDTO, index: number) => (
                        <QuestionCard
                            key={q.questionId}
                            q={q}
                            index={index}
                            changeQuestionType={changeQuestionType}
                            deleteQuestion={deleteQuestion}
                            updateQuestion={updateQuestion}
                            addOption={editor.addOption}
                            updateOption={editor.updateOption}
                            removeOption={editor.removeOption}
                            RATING_SCALE_MIN={RATING_SCALE_MIN}
                            RATING_SCALE_MAX={RATING_SCALE_MAX}
                            parseOptionalInt={parseOptionalInt}
                            clampInt={clampInt}
                        />
                    ))}
                </div>

                <div className="flex justify-center pt-2">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-input bg-card px-10 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        onClick={addQuestion}
                    >
                        <Plus size={16} />
                        Add New
                    </button>
                </div>
            </div>

            {showPublishPopup && (
                <PublishSurveyPopup
                    surveyLink={
                        surveyId
                            ? `http://localhost:5173/survey/${surveyId}`
                            : "http://localhost:5173/survey/"
                    }
                    onBack={() => setShowPublishPopup(false)}
                    onPublish={handlePublish}
                />
            )}

            {showSuccessPopup && (
                <PopupWindow
                    text={
                        <p className="text-lg font-medium">
                            Survey &quot;{surveyName}&quot; has been successfully published!
                        </p>
                    }
                    firstButtonText="Go back to admin dashboard"
                    onFirstClick={() => {
                        setShowSuccessPopup(false);
                        goBackToDashboard();
                    }}
                />
            )}

            {showDiscardChangesPopup && (
                <PopupWindow
                    text={
                        <>
                            <p className="text-lg font-semibold">Discard unsaved changes?</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                If you continue, your current changes will be lost.
                            </p>
                        </>
                    }
                    firstButtonText="Discard changes"
                    onFirstClick={discardChangesAndLeave}
                    secondButtonText="Cancel"
                    onSecondClick={cancelDiscardChanges}
                />
            )}
        </>
    );
}