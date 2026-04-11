import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ChevronDown, X } from "lucide-react";
import { SurveyStatus } from "@shared/models/dtos/enums/SurveyStatus";
import { FilterSortProps, SortValues } from "./type";
import { Dropdown } from "../common/Dropdown";

const SortOptions: { value: SortValues; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "title-asc", label: "Title (A-Z)" },
    { value: "title-desc", label: "Title (Z-A)" },
    { value: "questions", label: "Most Questions" },
    { value: "shared", label: "Most Shared" },
    { value: "answers", label: "Most Answers" },
];

export function FilterSort({ surveys, onFiltered }: FilterSortProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<SurveyStatus | "all">("all");
    const [sortBy, setSortBy] = useState<SortValues>("newest");
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    const applyFiltersAndSort = (
        search: string,
        status: SurveyStatus | "all",
        sort: SortValues,
    ) => {
        let filtered = [...surveys];

        if (search.trim()) {
            filtered = filtered.filter(
                (survey) =>
                    survey.title.toLowerCase().includes(search.toLowerCase()) ||
                    survey.description?.toLowerCase().includes(search.toLowerCase()),
            );
        }

        if (status !== "all") {
            filtered = filtered.filter((survey) => survey.status === status);
        }

        const sorted = [...filtered];
        switch (sort) {
            case "title-asc":
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "title-desc":
                sorted.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case "newest":
                sorted.sort((a, b) => {
                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return bTime - aTime;
                });
                break;
            case "oldest":
                sorted.sort((a, b) => {
                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return aTime - bTime;
                });
                break;
            case "questions":
                sorted.sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0));
                break;
            case "shared":
                sorted.sort((a, b) => (b.sharedCount || 0) - (a.sharedCount || 0));
                break;
            case "answers":
                sorted.sort((a, b) => (b.answerCount || 0) - (a.answerCount || 0));
                break;
        }

        onFiltered(sorted);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusFilter = (status: SurveyStatus | "all") => {
        setStatusFilter(status);
        setShowStatusMenu(false);
    };

    const handleSort = (sort: SortValues) => {
        setSortBy(sort);
        setShowSortMenu(false);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setSortBy("newest");
        setShowStatusMenu(false);
        setShowSortMenu(false);
    };

    useEffect(() => {
        applyFiltersAndSort(searchTerm, statusFilter, sortBy);
    }, [searchTerm, statusFilter, sortBy, surveys]);

    const isFiltered =
        searchTerm !== "" || statusFilter !== "all" || sortBy !== "newest";

    const menuClassName =
        "absolute left-0 top-full z-10 mt-1 min-w-52 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg";

    const optionClassName = (active: boolean) =>
        `block w-full px-4 py-2 text-left text-sm transition hover:bg-accent hover:text-accent-foreground ${
            active ? "bg-accent font-semibold text-accent-foreground" : ""
        }`;

    const activeSortLabel =
        SortOptions.find((option) => option.value === sortBy)?.label ?? "Newest First";

    return (
        <div className="mb-6 space-y-4">
            <div>
                <Input
                    type="text"
                    placeholder="Search surveys by title or description..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowStatusMenu((prev) => !prev);
                            setShowSortMenu(false);
                        }}
                        className="flex items-center gap-2 bg-card"
                    >
                        Status:
                        <span className="font-semibold">
              {statusFilter === "all"
                  ? "All"
                  : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>

                    {showStatusMenu && (
                        <div className={menuClassName}>
                            <button
                                onClick={() => handleStatusFilter("all")}
                                className={optionClassName(statusFilter === "all")}
                            >
                                All Surveys
                            </button>
                            <button
                                onClick={() => handleStatusFilter(SurveyStatus.New)}
                                className={optionClassName(statusFilter === SurveyStatus.New)}
                            >
                                New
                            </button>
                            <button
                                onClick={() => handleStatusFilter(SurveyStatus.Active)}
                                className={optionClassName(statusFilter === SurveyStatus.Active)}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => handleStatusFilter(SurveyStatus.Closed)}
                                className={optionClassName(statusFilter === SurveyStatus.Closed)}
                            >
                                Closed
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowSortMenu((prev) => !prev);
                            setShowStatusMenu(false);
                        }}
                        className="flex items-center gap-2 bg-card"
                    >
                        Sort:
                        <span className="font-semibold">{activeSortLabel}</span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>

                    {showSortMenu && (
                        <div className={menuClassName}>
                            {SortOptions.map((option) => (
                                <Dropdown
                                    key={option.value}
                                    onClick={() => handleSort(option.value)}
                                    className={optionClassName(sortBy === option.value)}
                                >
                                    {option.label}
                                </Dropdown>
                            ))}
                        </div>
                    )}
                </div>

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X className="h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>

            {isFiltered && (
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className="text-muted-foreground">Active filters:</span>

                    {searchTerm && (
                        <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
              Search: "{searchTerm}"
            </span>
                    )}

                    {statusFilter !== "all" && (
                        <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
              Status: {statusFilter}
            </span>
                    )}

                    {sortBy !== "newest" && (
                        <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
              Sort: {activeSortLabel}
            </span>
                    )}
                </div>
            )}
        </div>
    );
}