import { MAX_URL_LENGTH } from "@page-pulse/shared";

export interface ValidationFailure {
  ok: false;
  error: string;
}

export interface ValidationSuccess {
  ok: true;
  url: URL;
}

export type ValidationResult = ValidationFailure | ValidationSuccess;

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** Hostnames that always resolve to the machine running the Worker or a loopback address. */
const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "::1", "ip6-localhost", "ip6-loopback"]);

/** Suffixes commonly used for internal / non-routable services. */
const BLOCKED_HOSTNAME_SUFFIXES = [".local", ".internal", ".localdomain", ".lan", ".home", ".corp"];

function fail(error: string): ValidationFailure {
  return { ok: false, error };
}

/**
 * True if the given hostname is a literal IPv4 address that falls inside a
 * private, loopback, link-local, or otherwise non-public range.
 */
function isPrivateIPv4(hostname: string): boolean {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;

  const octets = match.slice(1, 5).map(Number);
  if (octets.some((n) => n < 0 || n > 255)) return false;
  const [a, b] = octets;

  if (a === 127) return true; // loopback
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 (link-local / cloud metadata)
  if (a === 0) return true; // "this" network
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (carrier-grade NAT)

  return false;
}

/** True if the given hostname is a literal IPv6 loopback, link-local, or unique-local address. */
function isPrivateIPv6(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "::1") return true;
  if (host.startsWith("fe80:")) return true; // link-local
  if (host.startsWith("fc") || host.startsWith("fd")) return true; // unique local (fc00::/7)
  if (host.startsWith("::ffff:")) {
    // IPv4-mapped IPv6 address, e.g. ::ffff:127.0.0.1
    const mapped = host.replace("::ffff:", "");
    if (isPrivateIPv4(mapped)) return true;
  }
  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(lower)) return true;
  if (BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => lower.endsWith(suffix))) return true;
  if (isPrivateIPv4(lower)) return true;
  if (isPrivateIPv6(lower)) return true;
  return false;
}

/**
 * Validates a user-supplied URL string against length, syntax, protocol,
 * and SSRF (server-side request forgery) rules.
 *
 * Returns a parsed URL on success, or a human-readable error on failure.
 */
export function validateUrl(input: unknown): ValidationResult {
  if (typeof input !== "string" || input.trim().length === 0) {
    return fail("Please enter a URL to analyze.");
  }

  const trimmed = input.trim();

  if (trimmed.length > MAX_URL_LENGTH) {
    return fail(`URL is too long (max ${MAX_URL_LENGTH} characters).`);
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return fail("That doesn't look like a valid URL.");
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return fail(`Protocol "${parsed.protocol.replace(":", "")}" is not supported. Use http or https.`);
  }

  if (!parsed.hostname) {
    return fail("URL is missing a hostname.");
  }

  if (isBlockedHostname(parsed.hostname)) {
    return fail("This host cannot be analyzed for security reasons.");
  }

  return { ok: true, url: parsed };
}
