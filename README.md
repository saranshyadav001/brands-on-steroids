# Brands On Steroids - website

Next.js 14 + Tailwind one-page site.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Catalogue videos

The catalogue is built automatically from the folder

```
website p upload krne k liye content/md
```

inside this project (change the path in `data/catalogue.js` if you rename it).

- A **folder** inside `md` = one series (one card). Every video in it is an episode, in file-name order.
  A file with "trailer" in its name is shown first as "Trailer".
- A **loose video** inside `md` = its own card with a single video.
- Any image in a series folder (e.g. `poster.jpg`) becomes the card poster. Without one, the first
  frame of the first video is used.
- Use `.mp4` (H.264 + AAC) so every browser can play it.
- Plot text, cast/tag chips, like/save numbers and locked episodes are optional and are set per
  series in `data/catalogue.js`.

Add or remove files and refresh the page - no code change needed.

## Video protection

- The player has no download button, no right-click menu, no picture-in-picture and no cast menu.
- Video files are not in `/public`. They are streamed by `app/api/stream/[id]/route.js` through
  signed links that expire after 12 hours and only work inside the player on this site. Opening a
  video link in a new tab, "Save link as", `curl`, or embedding it on another site returns 403.
- No website can stop screen recording, and a technical person can still capture what their own
  browser plays. This blocks the normal ways of saving a video.

## Enquiry form

Copy `.env.example` to `.env.local` and fill in `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
When deploying, also set `STREAM_SECRET` to any long random string.

## Where to edit

| What | File |
| --- | --- |
| Site text, services, team, contact links | `data/site.js` |
| Catalogue folder + per-series details | `data/catalogue.js` |
| Catalogue grid | `components/Catalogue.js` |
| Full-page watch popup | `components/WatchModal.js` |
| Video player | `components/Player.js` |
