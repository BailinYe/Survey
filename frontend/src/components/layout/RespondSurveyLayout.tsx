import { Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import Logo from "@/components/common/Logo";
import { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";
import { Survey as mockSurvey } from "@/mocks/tempSurveyData";

export default function RespondSurveyLayout() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<SurveyDTO | null>(null);

  useEffect(() => {
    // For now, use mock data. Later this will be an API call
    setSurvey(mockSurvey);
  }, [surveyId]);

  return (
    <div className="flex flex-row min-h-screen">
      {/* Left Panel - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:flex w-64 border-r bg-gray-50 p-6 flex-col">
        {/* Logo section */}
        <div className="border-b pb-6">
          <Logo />
        </div>

        {/* Small spacer - brings content closer to top */}
        <div className="h-12" />

        {/* Author section + CTA section grouped together */}
        <div className="flex flex-col items-center gap-6">
          {/* Author section */}
          {survey && (
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 bg-gray-200 rounded-full p-3 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-center">
                Authors: {survey.authorId}
              </p>
            </div>
          )}

          {/* CTA section */}
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              Wanna make your own Survey? Use our tool!
            </p>
            <a
              href="/auth/signup"
              className="text-sm underline text-blue-600 font-medium hover:text-blue-700"
            >
              Learn more
            </a>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="flex-1" />
      </div>

      {/* Main content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
