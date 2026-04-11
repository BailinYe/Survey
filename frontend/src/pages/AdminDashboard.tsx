import { useNavigate } from "react-router-dom";

import { auth } from "../firebase/firebase";
import { Button } from "../components/ui/button";

import { Plus } from "lucide-react";
import Card from "@/components/common/Card";

import { useEffect, useState } from "react";
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";
import { SurveyDTO as Survey } from "@shared/models/dtos/types/SurveyDTO";

import { FilterSort } from "@/components/utils/FilterSort";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchSurveys() {
      try {
        setIsLoading(true);
        setError("");
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const res = await fetch(`${apiUrl}/api/surveys`, {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch surveys: ${res.statusText}`);
        }

        const data = await res.json();
        setSurveys(data || []);
        setFilteredSurveys(data || []);
      } catch (err) {
        console.error("Failed to fetch surveys:", err);
        setError(err?.message || "Failed to load surveys");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSurveys();
  }, [navigate]);

  const getStatusBadge = (status?: SurveyStatus) => {
    const statusValue = status || SurveyStatus.Active;
    const statusMap: Record<SurveyStatus, { bg: string; text: string }> = {
      [SurveyStatus.New]: { bg: "bg-blue-100", text: "text-blue-800" },
      [SurveyStatus.Active]: { bg: "bg-green-100", text: "text-green-800" },
      [SurveyStatus.Closed]: { bg: "bg-yellow-100", text: "text-yellow-800" },
    };
    const style = statusMap[statusValue];
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}
      >
        {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
      </span>
    );
  };

  return (
      <>
          {/* Right Content */}
          <div className="flex flex-col w-full lg:flex-1 px-6 lg:px-10 py-6 gap-2 lg:border-l-2 lg:border-gray-200">
              <h1 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-7">
                  My Surveys
              </h1>
              <FilterSort surveys={surveys} onFiltered={setFilteredSurveys} />

              {/* Error State */}
              {error && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                  </div>
              )}

              {/* Loading State */}
              {isLoading ? (
                  <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading surveys...</p>
                  </div>
              ) : surveys.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                          No surveys yet. Create your first survey!
                      </p>
                      <Card className="inline-block mb-4">
                          <Button onClick={() => navigate("/admin-dashboard/surveys/new")}>
                              <Plus className="mr-2 h-4 w-4" /> Create New Survey
                          </Button>
                      </Card>
                  </div>
              ) : filteredSurveys.length === 0 ? (
                  <div className="text-center py-12">
                      <p className="text-muted-foreground">
                          No surveys match your filters.
                      </p>
                  </div>
              ) : (
                  /* Surveys Grid */
                  <div className="self-center">
                      {/* Create New Survey Card + Survey Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          <Card
                              className="flex flex-col justify-center items-center min-h-48 hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed"
                              onClick={() => navigate("/admin-dashboard/surveys/new")}
                          >
                              <Plus className="h-12 w-12 text-gray-400 mb-2" />
                              <h3 className="text-xl font-semibold mb-2">
                                  Create a New Survey
                              </h3>
                              <p className="text-sm text-muted-foreground text-center">
                                  Start from scratch
                              </p>
                          </Card>

                          {/* Survey Cards */}
                          {filteredSurveys.map((survey) => (
                              <Card
                                  key={survey.id}
                                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                  onClick={() => {
                                    if (survey.status === SurveyStatus.New) {
                                      navigate(`/admin-dashboard/surveys/${survey.id}/edit`);
                                    } else {
                                      navigate(`/admin-dashboard/surveys/${survey.id}/analytics`);
                                    }
                                  }}
                              >
                                  <div className="space-y-3">
                                      <div className="flex justify-between items-start gap-2">
                                          <h3 className="text-lg font-semibold line-clamp-2">
                                              {survey.title}
                                          </h3>
                                          {getStatusBadge(survey.status)}
                                      </div>

                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                          {survey.description || "No description"}
                                      </p>

                                      <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
                                          <div>
                                              <p className="font-medium">
                                                  {survey.questionCount || 0}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                  {survey.questionCount >1?"Questions":"Question"}
                                              </p>
                                          </div>
                                          <div>
                                            <p className="font-medium">{survey.sharedCount || 0}</p>
                                            <p className="text-xs text-muted-foreground">Shared</p>
                                          </div>
                                          <div>
                                              <p className="font-medium">{survey.answerCount || 0}</p>
                                              <p className="text-xs text-muted-foreground">Answers</p>
                                          </div>
                                      </div>
                                  </div>
                              </Card>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </>
  );
}
