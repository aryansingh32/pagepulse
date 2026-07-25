import { FETCH_TIMEOUT_MS } from "@page-pulse/shared";

export class FetchTimeoutError extends Error {
  constructor() {
    super("Request timed out");
    this.name = "FetchTimeoutError";
  }
}

/**
 * Wraps fetch() with an AbortController-based timeout so a slow or hanging
 * origin server can never keep the Worker (and the user) waiting forever.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new FetchTimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
