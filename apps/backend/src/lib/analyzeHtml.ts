export interface HtmlAnalysis {
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  imagesMissingAlt: number;
  wordCount: number;
}

/** Elements whose content must never contribute to word count or text extraction. */
const NON_VISIBLE_TAGS = "script, style, noscript, svg, template";

function htmlResponse(html: string): Response {
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

/**
 * Parses raw HTML and extracts the metrics Page Pulse reports on.
 *
 * Runs in two passes:
 *  1. Strip script/style/noscript/svg/template content entirely, since it is
 *     never rendered to the visitor and must not pollute the word count.
 *  2. Walk the cleaned document to pull the title, meta description, H1
 *     count, images missing alt text, and the visible body word count.
 */
export async function analyzeHtml(html: string): Promise<HtmlAnalysis> {
  const strippedResponse = new HTMLRewriter()
    .on(NON_VISIBLE_TAGS, {
      element(el) {
        el.remove();
      },
    })
    .transform(htmlResponse(html));
  const cleanedHtml = await strippedResponse.text();

  let title: string | null = null;
  let titleClosed = false;
  let metaDescription: string | null = null;
  let h1Count = 0;
  let imagesMissingAlt = 0;
  const bodyTextChunks: string[] = [];

  const analyzed = new HTMLRewriter()
    .on("title", {
      text(chunk) {
        if (titleClosed) return;
        title = (title ?? "") + chunk.text;
        if (chunk.lastInTextNode) {
          const trimmed = title.trim();
          title = trimmed.length > 0 ? trimmed : null;
          titleClosed = true;
        }
      },
    })
    .on('meta[name="description" i]', {
      element(el) {
        if (metaDescription !== null) return;
        const content = el.getAttribute("content");
        if (content && content.trim().length > 0) {
          metaDescription = content.trim();
        }
      },
    })
    .on("h1", {
      element() {
        h1Count += 1;
      },
    })
    .on("img", {
      element(el) {
        const alt = el.getAttribute("alt");
        if (alt === null || alt.trim().length === 0) {
          imagesMissingAlt += 1;
        }
      },
    })
    .on("body", {
      text(chunk) {
        bodyTextChunks.push(chunk.text);
      },
    })
    .transform(htmlResponse(cleanedHtml));

  // Draining the stream is what actually drives the parser/handlers.
  await analyzed.text();

  const wordCount = bodyTextChunks
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((word) => word.length > 0).length;

  return { title, metaDescription, h1Count, imagesMissingAlt, wordCount };
}
