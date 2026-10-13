// Only used by `npm run dev` (the ".dev.js" ending keeps it out of the published site,
// where the Cloudflare Worker in worker/index.js answers instead). The logic is in lib/api.js.
import { enquiryResponse } from "@/lib/api";

export const POST = (req) => enquiryResponse(req);
