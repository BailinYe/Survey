import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import SurveyHeader from "./SurveyHeader";
import ResponseCard from "./ResponseCard";

import { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";
import { AnswerValue } from "@shared/models/dtos/types/ResponseDTO";
import { CheckBoxDTO } from "@shared/models/dtos/types/QuestionDTO";

// Import mock survey data
import { Survey as mockSurvey } from "@/mocks/tempSurveyData";

export default function RespondSurvey() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<SurveyDTO | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setSurvey(mockSurvey);
    setIsLoading(false);
  }, [surveyId]);

  const handleAnswerChange = (questionId: string, answer: AnswerValue) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    // Clear validation error when user answers
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const validateAnswers = (): boolean => {
    if (!survey) return false;

    const errors: Record<string, string> = {};

    for (const question of survey.questions) {
      const answer = answers[question.questionId];

      // Check required fields
      if (question.required && !answer) {
        errors[question.questionId] = "This question is required";
        continue;
      }

      // Skip validation if question is not answered and not required
      if (!answer) continue;

      // CheckBox min/max validation
      if (question.type === "checkBox") {
        const checkBoxQ = question as CheckBoxDTO;
        const selectedCount = (answer as { type: "checkBox"; value: string[] }).value.length;

        if (checkBoxQ.minSelect !== undefined && selectedCount < checkBoxQ.minSelect) {
          errors[question.questionId] = `Please select at least ${checkBoxQ.minSelect} option(s)`;
        }

        if (checkBoxQ.maxSelect !== undefined && selectedCount > checkBoxQ.maxSelect) {
          errors[question.questionId] = `Please select at most ${checkBoxQ.maxSelect} option(s)`;
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      setError("Please fix validation errors before submitting");
      return;
    }
    alert("Survey submitted successfully! (Mock mode - not sent to API)");
    navigate("/admin-dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading survey...</p>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
        <Button onClick={() => navigate("/admin-dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Survey not found</p>
        <Button onClick={() => navigate("/admin-dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 px-3 sm:px-4">
      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="default"
          className="rounded-full px-10"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>

      {/* Survey Header */}
      <SurveyHeader survey={survey} />

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Response Cards */}
      <div className="space-y-4">
        {survey.questions.map((question, index) => (
          <ResponseCard
            key={question.questionId}
            question={question}
            index={index}
            answer={answers[question.questionId]}
            onAnswerChange={handleAnswerChange}
            validationError={validationErrors[question.questionId]}
          />
        ))}
      </div>

      {/* Submit button at bottom */}
      <div className="flex justify-center pt-4">
        <Button
          type="button"
          variant="default"
          className="rounded-full px-10"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
