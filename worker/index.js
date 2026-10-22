// The live site's server: a small Cloudflare Worker. The pages themselves are plain static
// files (the `out` folder made by `next build`) that Cloudflare serves without running this.
// The Worker only answers /api/*: the list of videos, the videos themselves, the contact form.
import { EmailMessage } from "cloudflare:email";
import { libraryResponse, streamResponse, enquiryResponse, ENQUIRY } from "../lib/api.js";
import { useBucket } from "../lib/r2.js";

export default {
  async fetch(req, env) {
    useBucket(env.VIDEOS);
    const { pathname } = new URL(req.url);
    try {
      if (pathname === "/api/library" && req.method === "GET") return await libraryResponse();
      if (pathname.startsWith("/api/stream/") && req.method === "GET") return await streamResponse(req, pathname.slice("/api/stream/".length));
      if (pathname === "/api/enquiry" && req.method === "POST") {
        // form enquiries are emailed through Cloudflare Email Routing (binding "MAILER" in wrangler.jsonc)
        const mail = env.MAILER && ((to, raw) => env.MAILER.send(new EmailMessage(ENQUIRY.from, to, raw)));
        return await enquiryResponse(req, mail);
      }
    } catch (e) {
      console.error(e);
      return new Response("Server error", { status: 500, headers: { "Cache-Control": "no-store" } });
    }
    if (pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(req); // anything else that is not a file: the 404 page
  },
};
