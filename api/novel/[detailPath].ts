// Vercel Edge Function: SSR meta tags for /novel/:detailPath
// Crawlers (WhatsApp, FB, Twitter, iMessage) get rich previews; users still get the SPA.

export const config = { runtime: "edge" };

const escapeHtml = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const stripHtml = (s: string) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  // detailPath is the last segment of the path
  const segments = url.pathname.split("/").filter(Boolean);
  const detailPath = decodeURIComponent(segments[segments.length - 1] || "");

  // Fetch the static index.html shell from the same deployment
  const shellUrl = `${url.origin}/index.html`;
  const shellRes = await fetch(shellUrl, { headers: { "user-agent": "nabees-og-ssr" } });
  let html = await shellRes.text();

  try {
    const apiRes = await fetch(
      `https://novel-api.nabaikabaiaguo.workers.dev/novel/${encodeURIComponent(detailPath)}`,
      { headers: { Accept: "application/json" } },
    );
    if (apiRes.ok) {
      const json: any = await apiRes.json();
      const novel = json?.data;
      if (novel?.title) {
        const title = `${novel.title} by ${novel.author} | Nabees Novel Zone`;
        const rawDesc = stripHtml(novel.summary || "") ||
          `Read ${novel.title} by ${novel.author} — ${novel.totalChapters || ""} chapters on Nabees Novel Zone.`;
        const desc = rawDesc.length > 160 ? rawDesc.slice(0, 157) + "…" : rawDesc;
        const image = novel.cover?.url || "https://aqrmhkzrrmpljrtknrpi.supabase.co/storage/v1/object/public/uploads/2FJA2C.jpg";
        const canonical = `https://nabeesnovelzone.app/novel/${detailPath}`;

        const T = escapeHtml(title);
        const D = escapeHtml(desc);
        const I = escapeHtml(image);
        const C = escapeHtml(canonical);

        html = html
          .replace(/<title>[\s\S]*?<\/title>/i, `<title>${T}</title>`)
          .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${D}" />`)
          .replace(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${T}" />`)
          .replace(/<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${D}" />`)
          .replace(/<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${I}" />`)
          .replace(/<meta\s+property="og:type"[^>]*>/i, `<meta property="og:type" content="book" />`)
          .replace(/<meta\s+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${I}" />`);

        const extras = `
    <link rel="canonical" href="${C}" />
    <meta property="og:url" content="${C}" />
    <meta name="twitter:title" content="${T}" />
    <meta name="twitter:description" content="${D}" />
    <meta property="og:image:alt" content="${escapeHtml(novel.title)} cover" />
  `;
        html = html.replace(/<\/head>/i, `${extras}</head>`);
      }
    }
  } catch (e) {
    // fall through with default shell
  }

  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=600",
    },
  });
}
