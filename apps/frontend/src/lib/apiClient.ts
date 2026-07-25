import type { AnalyzeReport, AnalyzeRequest, AnalyzeResult, ApiErrorBody } from "@page-pulse/shared";

/**
 * Base URL for the backend API. In development, Vite proxies /api to the
 * local Worker (see vite.config.ts). In production, set VITE_API_BASE_URL
 * to the deployed Worker URL (e.g. https://page-pulse-api.<subdomain>.workers.dev).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function postJson<TResponse>(path: string, body: unknown): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON body (e.g. upstream gateway error page); fall through with null.
  }

  return { status: res.status, data: data as TResponse };
}

/**
 * Calls POST /api/analyze and normalizes the outcome into a discriminated
 * union so callers never need a try/catch to handle failures.
 */
export async function analyzeUrl(url: string): Promise<AnalyzeResult> {
  try {
    const request: AnalyzeRequest = { url };
    const { status, data } = await postJson<AnalyzeReport | ApiErrorBody>("/api/analyze", request);

    if (status >= 200 && status < 300 && data && typeof data === "object" && "httpStatus" in data) {
      return { ok: true, data: data as AnalyzeReport };
    }

    const errorMessage =
      data && typeof data === "object" && "error" in data && typeof (data as ApiErrorBody).error === "string"
        ? (data as ApiErrorBody).error
        : "Something went wrong while analyzing that page.";

    return { ok: false, error: errorMessage, status };
  } catch {
    return { ok: false, error: "Could not reach the Page Pulse API. Check your connection and try again.", status: 0 };
  }
}
