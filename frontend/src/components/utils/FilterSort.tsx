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

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(
        (survey) =>
          survey.title.toLowerCase().includes(search.toLowerCase()) ||
          survey.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Status filter
    if (status !== "all") {
      filtered = filtered.filter((survey) => survey.status === status);
    }

    // Sorting
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
    const value = e.target.value;
    setSearchTerm(value);
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
  };

  useEffect(() => {
    applyFiltersAndSort(searchTerm, statusFilter, sortBy);
  }, [searchTerm, statusFilter, sortBy, surveys]);

  const isFiltered =
    searchTerm !== "" || statusFilter !== "all" || sortBy !== "newest";

  return (
    <div className="space-y-4 mb-6">
      {/* Search Input */}
      <div>
        <Input
          type="text"
          placeholder="Search surveys by title or description..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full"
        />
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status Filter Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="flex items-center gap-2"
          >
            Status:{" "}
            <span className="font-semibold">
              {statusFilter === "all"
                ? "All"
                : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-48">
              <button
                onClick={() => handleStatusFilter("all")}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  statusFilter === "all" ? "bg-blue-50 font-semibold" : ""
                }`}
              >
                All Surveys
              </button>
              <button
                onClick={() => handleStatusFilter(SurveyStatus.Active)}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  statusFilter === SurveyStatus.Active
                    ? "bg-blue-50 font-semibold"
                    : ""
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleStatusFilter(SurveyStatus.Closed)}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  statusFilter === SurveyStatus.Closed
                    ? "bg-blue-50 font-semibold"
                    : ""
                }`}
              >
                Closed
              </button>
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2"
          >
            Sort: <span className="font-semibold">{sortBy}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {showSortMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-48">
              {SortOptions.map((option) => (
                <Dropdown
                  key={option.value}
                  onClick={() => handleSort(option.value)}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    sortBy === option.value ? "bg-blue-50 font-semibold" : ""
                  }`}
                >
                  {option.label}
                </Dropdown>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" /> Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {isFiltered && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-gray-600">Active filters:</span>
          {searchTerm && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Search: "{searchTerm}"
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Status: {statusFilter}
            </span>
          )}
          {sortBy !== "newest" && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Sort: {sortBy}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
