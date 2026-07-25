import { z } from "zod";
import { MAX_URL_LENGTH } from "@page-pulse/shared";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "::1"]);
const BLOCKED_SUFFIXES = [".local", ".internal", ".localdomain", ".lan", ".home", ".corp"];

function isPrivateIPv4(hostname: string): boolean {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const [a, b] = match.slice(1, 3).map(Number);
  if (a === 127 || a === 10 || a === 0) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

/**
 * Mirrors the backend's SSRF and protocol checks so the form can surface an
 * error instantly, without waiting on a round trip. The backend remains the
 * source of truth and re-validates independently.
 */
export const urlSchema = z
  .string()
  .trim()
  .min(1, "Enter a URL to analyze.")
  .max(MAX_URL_LENGTH, `URL is too long (max ${MAX_URL_LENGTH} characters).`)
  .superRefine((value, ctx) => {
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid URL, e.g. https://example.com" });
      return;
    }

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Only http and https URLs are supported." });
      return;
    }

    const host = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.has(host) || BLOCKED_SUFFIXES.some((s) => host.endsWith(s)) || isPrivateIPv4(host)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "This host cannot be analyzed for security reasons." });
    }
  });

export const analyzeFormSchema = z.object({
  url: urlSchema,
});

export type AnalyzeFormValues = z.infer<typeof analyzeFormSchema>;
