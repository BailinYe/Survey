import { SurveyDTO as Survey } from "@shared/models/dtos/types/SurveyDTO";

export type SortValues = 
  | "title-asc"
  | "title-desc"
  | "newest"
  | "oldest"
  | "questions"
  | "shared"
  | "answers";

export interface FilterSortProps {
  surveys: Survey[];
  onFiltered: (filtered: Survey[]) => void;
}
