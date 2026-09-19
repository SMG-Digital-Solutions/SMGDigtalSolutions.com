import type { Config, Context } from "@netlify/edge-functions";

/**
 * Manual reverse proxy for /admin/* to the separate admin app (its own
 * Netlify site + Next.js + Prisma/Neon, kept out of this repo — see
 * smg-admin/README.md).
 *
 * Replaces a plain `[[redirects]]` external-URL rewrite that used to live
 * in netlify.toml (to = "https://smgdigitalsolutionsadmin.netlify.app/...",
 * status = 200). That rewrite consistently 500'd — empty body — for every
 * single /admin/* path, and the admin app's own function logs confirmed the
 * request never even arrived there. The admin app works fine hit directly;
 * this is specifically a Netlify-to-Netlify proxying failure in the
 * built-in redirect mechanism. Doing the fetch ourselves here sidesteps
 * whatever that was doing, while keeping the URL bar on
 * smgdigitalsolutions.com the whole time, exactly like before — visitors
 * and the browser never see the split between the two apps. No new domain
 * needed (deliberately — see conversation with the site owner).
 */
const ADMIN_ORIGIN = "https://smgdigitalsolutionsadmin.netlify.app";

/**
 * fetch() hands back an already-decompressed `response.body`, but
 * `response.headers` still reports whatever Content-Encoding the origin
 * actually sent over the wire — forwarding that header verbatim alongside
 * the decompressed body makes the browser try to re-decompress plain
 * content and fail. Content-Length is wrong for the same reason (it
 * describes the original wire size, not this new stream). Transfer-Encoding
 * and Connection are classic hop-by-hop headers no proxy should relay.
 */
const STRIPPED_RESPONSE_HEADERS = ["content-encoding", "content-length", "transfer-encoding", "connection"];

export default async (request: Request, _context: Context) => {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, ADMIN_ORIGIN);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  const response = await fetch(target, {
    method: request.method,
    headers: request.headers,
    // Buffered rather than streamed straight through — sidesteps any
    // runtime-specific duplex-mode requirements for streaming request
    // bodies. Fine at this scale: form submissions and the odd admin
    // upload, capped at 10mb by the admin app's own Server Actions config.
    body: hasBody ? await request.arrayBuffer() : undefined,
    // Manual, not "follow": a 307 from the admin app (e.g. to its own
    // /admin/login) carries a relative Location header. Passed straight
    // through to the browser, that resolves correctly against
    // smgdigitalsolutions.com — exactly the transparent-proxy behavior we
    // want. Following it here instead would fetch the redirect target
    // server-side and hand back its content under the wrong URL.
    redirect: "manual",
  });

  const headers = new Headers(response.headers);
  for (const header of STRIPPED_RESPONSE_HEADERS) headers.delete(header);

  return new Response(response.body, { status: response.status, headers });
};

export const config: Config = {
  path: ["/admin", "/admin/*"],
};
