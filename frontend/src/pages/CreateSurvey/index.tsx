// Shared DTO enums/types
// import { QuestionType } from "@shared/models/dtos/enums/QuestionType";
// import type {
//     QuestionDTO,
//     MultipleChoiceDTO,
//     CheckBoxDTO,
//     ShortAnswerDTO,
//     RatingDTO,
// } from "@shared/models/dtos/types/QuestionDTO";
import { QuestionDTO } from "@shared/models/dtos/types/QuestionDTO";

// Page components (extracted)
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
        surveyId, status,

        title, description, setTitle, setDescription,

        questions,

        // ui
        isLoadingSurvey, loadError, isSaving, saveError, saveSuccess,

        showPublishPopup, setShowPublishPopup, showSuccessPopup, setShowSuccessPopup,

        // derived
        surveyName, isEmptyDraft,

        // handlers
        changeQuestionType, deleteQuestion, updateQuestion, addQuestion, openPublish, handlePublish, handleSave,
        goBackToDashboard,
    } = editor;

    return (
        <>
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6 px-3 sm:px-4">
                {/* Top action buttons */}
                <CreateSurveyActionsBar
                    status={status}
                    isSaving={isSaving}
                    isLoadingSurvey={isLoadingSurvey}
                    isEmptyDraft={isEmptyDraft}
                    hasSurveyId={Boolean(surveyId)}
                    onSave={handleSave}
                    onPublish={openPublish}
                />

                {/* Load/Save feedback */}
                <CreateSurveyAlerts
                    isLoadingSurvey={isLoadingSurvey}
                    loadError={loadError}
                    saveError={saveError}
                    saveSuccess={saveSuccess}
                />

                {/* Survey header (title + description) */}
                <SurveyHeaderCard
                    title={title}
                    description={description}
                    setTitle={setTitle}
                    setDescription={setDescription}
                />

                {/* Questions list */}
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

                {/* Add question */}
                <div className="flex justify-center pt-2">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full border border-input bg-background
                                   px-10 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        onClick={addQuestion}
                    >
                        Add New
                    </button>
                </div>
            </div>

            {/* Publish popup */}
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

            {/* Success popup after publish */}
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
        </>
    );
}