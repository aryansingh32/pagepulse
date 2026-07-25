/**
 * Shared contract between the Page Pulse frontend and backend.
 * Keeping this in one place means the API and the UI can never drift apart.
 */

/** Request body for POST /api/analyze */
export interface AnalyzeRequest {
  url: string;
}

/** Successful audit result returned by POST /api/analyze */
export interface AnalyzeReport {
  httpStatus: number;
  responseTime: number;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  imagesMissingAlt: number;
  wordCount: number;
  finalUrl: string;
}

/** Shape of every error response returned by the API */
export interface ApiErrorBody {
  error: string;
}

/** Discriminated union representing the outcome of an analyze call */
export type AnalyzeResult =
  | { ok: true; data: AnalyzeReport }
  | { ok: false; error: string; status: number };

/** Buckets used to color-code an HTTP status in the UI */
export type StatusCategory = "success" | "redirect" | "clientError" | "serverError" | "unknown";

export function categorizeStatus(status: number): StatusCategory {
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "redirect";
  if (status >= 400 && status < 500) return "clientError";
  if (status >= 500 && status < 600) return "serverError";
  return "unknown";
}

export const MAX_URL_LENGTH = 2048;
export const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2MB
export const FETCH_TIMEOUT_MS = 8000;
