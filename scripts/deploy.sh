#!/bin/sh
# Builds the site and publishes it to Cloudflare.  Run with:  npm run deploy
set -e
cd "$(dirname "$0")/.."

# Cloudflare deploy token (git-ignored file). Without it, `npx wrangler login` must have been done.
if [ -f .cloudflare.env ]; then set -a; . ./.cloudflare.env; set +a; fi

npx next build          # the pages -> ./out
npx wrangler deploy     # ./out + the Worker (worker/index.js)
