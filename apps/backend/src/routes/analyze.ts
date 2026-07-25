import { Hono, type Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AnalyzeReport, AnalyzeRequest } from "@page-pulse/shared";
import type { Env } from "../types";
import { validateUrl } from "../lib/validateUrl";
import { fetchWithTimeout, FetchTimeoutError } from "../lib/fetchWithTimeout";
import { readBodyWithLimit, ResponseTooLargeError } from "../lib/readBodyWithLimit";
import { analyzeHtml } from "../lib/analyzeHtml";

export const analyzeRoute = new Hono<{ Bindings: Env }>();

type AppContext = Context<{ Bindings: Env }>;

/** Small helper so every error branch returns the same `{ error }` shape with the right status. */
function jsonError(c: AppContext, status: ContentfulStatusCode, message: string) {
  return c.json({ error: message }, status);
}

analyzeRoute.post("/analyze", async (c) => {
  let body: Partial<AnalyzeRequest>;
  try {
    body = await c.req.json<Partial<AnalyzeRequest>>();
  } catch {
    return jsonError(c, 400, "Request body must be valid JSON.");
  }

  const validation = validateUrl(body.url);
  if (!validation.ok) {
    return jsonError(c, 400, validation.error);
  }

  const targetUrl = validation.url;
  const startedAt = Date.now();

  let response: Response;
  try {
    response = await fetchWithTimeout(targetUrl.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        "user-agent": "PagePulse/1.0 (+https://digitalheroesco.com) Website Auditor",
        accept: "text/html,application/xhtml+xml",
      },
    });
  } catch (err) {
    return handleFetchError(c, err);
  }

  const responseTime = Date.now() - startedAt;
  const httpStatus = response.status;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("text/html")) {
    return jsonError(c, 415, "The URL did not return an HTML page.");
  }

  let html: string;
  try {
    html = await readBodyWithLimit(response);
  } catch (err) {
    if (err instanceof ResponseTooLargeError) {
      return jsonError(c, 413, "The page is too large to analyze (limit 2MB).");
    }
    return jsonError(c, 502, "Failed to read the response from the target site.");
  }

  const analysis = await analyzeHtml(html);

  const report: AnalyzeReport = {
    httpStatus,
    responseTime,
    title: analysis.title,
    metaDescription: analysis.metaDescription,
    h1Count: analysis.h1Count,
    imagesMissingAlt: analysis.imagesMissingAlt,
    wordCount: analysis.wordCount,
    finalUrl: response.url || targetUrl.toString(),
  };

  return c.json(report, 200);
});

function handleFetchError(c: AppContext, err: unknown) {
  if (err instanceof FetchTimeoutError) {
    return jsonError(c, 504, "Request timed out.");
  }

  const message = err instanceof Error ? err.message.toLowerCase() : "";

  if (message.includes("too many redirects") || message.includes("redirect")) {
    return jsonError(c, 502, "The site has a redirect loop.");
  }
  if (message.includes("dns") || message.includes("name not resolved") || message.includes("could not resolve")) {
    return jsonError(c, 502, "Could not resolve the domain (DNS failure).");
  }
  if (message.includes("ssl") || message.includes("tls") || message.includes("certificate")) {
    return jsonError(c, 502, "The site has an invalid SSL certificate.");
  }

  return jsonError(c, 502, "Could not reach the target site.");
}
