import type {
  NoteDto,
  NoteSummaryDto,
  PagedResult,
  CreateNoteRequest,
  UpdateNoteRequest,
  UserProfile,
  ProblemDetails,
} from "@/types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

let getAccessToken: (() => Promise<string>) | null = null;

export function setTokenProvider(provider: () => Promise<string>) {
  getAccessToken = provider;
}

class ApiError extends Error {
  status: number;
  problemDetails?: ProblemDetails;

  constructor(status: number, problemDetails?: ProblemDetails) {
    super(problemDetails?.detail || `API error: ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.problemDetails = problemDetails;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (getAccessToken) {
    const token = await getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("API request without token:", path);
    }
  } else {
    console.warn("No token provider set for API request:", path);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let problemDetails: ProblemDetails | undefined;
    try {
      problemDetails = await response.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, problemDetails);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  // Health
  health: () => request<{ status: string; timestamp: string }>("/health"),

  // Me
  me: () => request<UserProfile>("/me"),

  // Notes
  getNotes: (params?: {
    query?: string;
    pinned?: boolean;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set("query", params.query);
    if (params?.pinned !== undefined) searchParams.set("pinned", String(params.pinned));
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    const qs = searchParams.toString();
    return request<PagedResult<NoteSummaryDto>>(`/notes${qs ? `?${qs}` : ""}`);
  },

  getNote: (id: string) => request<NoteDto>(`/notes/${id}`),

  createNote: (data: CreateNoteRequest) =>
    request<NoteDto>("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateNote: (id: string, data: UpdateNoteRequest) =>
    request<NoteDto>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  pinNote: (id: string) =>
    request<void>(`/notes/${id}/pin`, { method: "POST" }),

  unpinNote: (id: string) =>
    request<void>(`/notes/${id}/unpin`, { method: "POST" }),

  deleteNote: (id: string) =>
    request<void>(`/notes/${id}`, { method: "DELETE" }),

  archiveNote: (id: string) =>
    request<void>(`/notes/${id}/archive`, { method: "POST" }),

  unarchiveNote: (id: string) =>
    request<void>(`/notes/${id}/unarchive`, { method: "POST" }),

  restoreNote: (id: string) =>
    request<void>(`/notes/${id}/restore`, { method: "POST" }),

  hardDeleteNote: (id: string) =>
    request<void>(`/notes/${id}/permanent`, { method: "DELETE" }),

  generateTitle: (id: string) =>
    request<NoteDto>(`/notes/${id}/generate-title`, { method: "POST" }),

  backfillEmbeddings: () =>
    request<{ total: number; updated: number; failed: number; skipped: number }>(
      "/notes/backfill-embeddings",
      { method: "POST" },
    ),

  searchNotes: (params: { query: string; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    searchParams.set("query", params.query);
    if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
    return request<PagedResult<NoteSummaryDto>>(`/notes/search?${searchParams}`);
  },

  askNotes: (params: { query: string }) =>
    request<{ answer: string | null; notes: NoteSummaryDto[] }>(
      `/notes/ask?query=${encodeURIComponent(params.query)}`,
    ),

  getArchivedNotes: (params?: {
    query?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set("query", params.query);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    const qs = searchParams.toString();
    return request<PagedResult<NoteSummaryDto>>(`/notes/archived${qs ? `?${qs}` : ""}`);
  },

  getDeletedNotes: (params?: {
    query?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set("query", params.query);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    const qs = searchParams.toString();
    return request<PagedResult<NoteSummaryDto>>(`/notes/deleted${qs ? `?${qs}` : ""}`);
  },
};

export { ApiError };
