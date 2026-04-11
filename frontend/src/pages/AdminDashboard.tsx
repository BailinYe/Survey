import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import Card from "@/components/common/Card";
import { FilterSort } from "@/components/utils/FilterSort";

import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";
import { SurveyDTO } from "@shared/models/dtos/types/SurveyDTO";

type AdminLayoutContext = {
    surveys: SurveyDTO[];
    isLoading: boolean;
    error: string;
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { surveys, isLoading, error } = useOutletContext<AdminLayoutContext>();

    const [filteredSurveys, setFilteredSurveys] = useState<SurveyDTO[]>([]);

    useEffect(() => {
        setFilteredSurveys(surveys);
    }, [surveys]);

    const getStatusBadge = (status?: SurveyStatus) => {
        const statusValue = status || SurveyStatus.Active;

        const statusClassMap: Record<SurveyStatus, string> = {
            [SurveyStatus.New]: "status-new",
            [SurveyStatus.Active]: "status-active",
            [SurveyStatus.Closed]: "status-closed",
        };

        return (
            <span className={`status-badge ${statusClassMap[statusValue]}`}>
        {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
      </span>
        );
    };

    return (
        <div className="flex w-full flex-col gap-2 px-6 py-6 lg:flex-1 lg:px-10">
            <h1 className="mb-7 pb-2 text-3xl font-semibold">My Surveys</h1>

            <FilterSort surveys={surveys} onFiltered={setFilteredSurveys} />

            {error && (
                <div className="mb-4 rounded border border-red-400/50 bg-red-100 px-4 py-4 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="py-12 text-center">
                    <p className="text-muted-foreground">Loading surveys...</p>
                </div>
            ) : surveys.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="mb-4 text-muted-foreground">
                        No surveys yet. Create your first survey!
                    </p>
                    <Card className="mb-4 inline-block">
                        <Button onClick={() => navigate("/admin-dashboard/surveys/new")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Survey
                        </Button>
                    </Card>
                </div>
            ) : filteredSurveys.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-muted-foreground">No surveys match your filters.</p>
                </div>
            ) : (
                <div className="self-center">
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card
                            className="flex min-h-48 cursor-pointer flex-col items-center justify-center border-2 border-dashed transition-shadow hover:shadow-lg"
                            onClick={() => navigate("/admin-dashboard/surveys/new")}
                        >
                            <Plus className="mb-2 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-xl font-semibold">Create a New Survey</h3>
                            <p className="text-center text-sm text-muted-foreground">
                                Start from scratch
                            </p>
                        </Card>

                        {filteredSurveys.map((survey) => (
                            <Card
                                key={survey.id}
                                className="cursor-pointer p-4 transition-shadow hover:shadow-lg"
                                onClick={() => {
                                    if (survey.status === SurveyStatus.New) {
                                        navigate(`/admin-dashboard/surveys/${survey.id}/edit`);
                                    } else {
                                        navigate(`/admin-dashboard/surveys/${survey.id}/analytics`);
                                    }
                                }}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="line-clamp-2 text-lg font-semibold">{survey.title}</h3>
                                        {getStatusBadge(survey.status)}
                                    </div>

                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                        {survey.description || "No description"}
                                    </p>

                                    <div className="flex justify-between border-t pt-2 text-sm">
                                        <div>
                                            <p className="font-medium">{survey.questionCount || 0}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {survey.questionCount > 1 ? "Questions" : "Question"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="font-medium">{survey.sharedCount || 0}</p>
                                            <p className="text-xs text-muted-foreground">Shared</p>
                                        </div>

                                        <div>
                                            <p className="font-medium">{survey.answerCount || 0}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(survey.answerCount || 0) === 1 ? "Answer" : "Answers"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}