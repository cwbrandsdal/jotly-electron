export interface NoteDto {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdUtc: string;
  updatedUtc: string;
}

export interface NoteSummaryDto {
  id: string;
  title: string;
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  updatedUtc: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateNoteRequest {
  title: string;
  body: string;
}

export interface UpdateNoteRequest {
  title: string;
  body: string;
}

export interface UserProfile {
  userId: string;
  organizationId: string | null;
}

export interface ProblemDetails {
  status: number;
  title: string;
  detail: string;
  errors?: Record<string, string[]>;
}
