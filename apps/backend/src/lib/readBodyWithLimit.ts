import { MAX_HTML_BYTES } from "@page-pulse/shared";

export class ResponseTooLargeError extends Error {
  constructor() {
    super("Response body exceeds the size limit");
    this.name = "ResponseTooLargeError";
  }
}

/**
 * Reads a Response body as text, aborting the moment it exceeds
 * `limitBytes`. Prevents a malicious or misconfigured origin from
 * streaming an unbounded response into the Worker.
 */
export async function readBodyWithLimit(response: Response, limitBytes: number = MAX_HTML_BYTES): Promise<string> {
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > limitBytes) {
    throw new ResponseTooLargeError();
  }

  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > limitBytes) {
        await reader.cancel();
        throw new ResponseTooLargeError();
      }
      chunks.push(value);
    }
  }

  const combined = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder("utf-8").decode(combined);
}
