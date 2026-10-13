// Only used by `npm run dev` (the ".dev.js" ending keeps it out of the published site,
// where the Cloudflare Worker in worker/index.js answers instead). The logic is in lib/api.js.
import { streamResponse } from "@/lib/api";

export const dynamic = "force-dynamic";
export const GET = async (req, { params }) => streamResponse(req, (await params).id);
