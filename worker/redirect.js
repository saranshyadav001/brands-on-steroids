// brandsonsteroids.com (no "www") -> https://www.brandsonsteroids.com, same page, in one step.
// Published together with the site by `npm run deploy` (settings: wrangler.redirect.jsonc).
export default {
  fetch(req) {
    const url = new URL(req.url);
    url.protocol = "https:";
    url.hostname = "www.brandsonsteroids.com";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  },
};
