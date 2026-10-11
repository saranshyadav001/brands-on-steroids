# Brands On Steroids - website

Next.js 14 + Tailwind one-page site.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Pages

| Page | Address | What it shows |
| --- | --- | --- |
| Home | `/` | Hero, the work grid, about, contact |
| Micro Drama | `/micro-drama` | Video hero, the micro-drama catalogue, services, about, contact |

The two buttons in the centre of the top bar switch between them; the current page is pink.

## Home page work grid

Built automatically from every video in `website p upload krne k liye content` that is **not**
inside the `md` folder. Loose videos form the first tab; each folder is its own tab.
Tab names, titles, hidden videos and the order are set in `data/work.js`.
The hero words are in `data/site.js` (`home`).

## Catalogue

The catalogue is built automatically from the folder

```
website p upload krne k liye content/md
```

- **One folder = one title** (one card). Put the title's video(s) in it.
- **Several videos = episodes.** `ep1`, `ep 2`, `part 3` in the file name sets the episode number.
  A file with "trailer" in its name is shown first as "Trailer".
- **The text file** in the folder (`description.md`, `discription.md`, any `.md` / `.txt`) supplies
  the title, the one-line hook, the plot, the genre chips and the details list. Lines written as
  `Name · value` (Genre, Format, Status ...) become the details; `Episode 1: Name` starts the text
  for one episode. The exact layout is described at the top of `data/catalogue.js`.
- **Card picture:** any image in the folder (e.g. `poster.jpg`). Without one, a frame of the video is used.
- **Card order:** A-Z by folder name, or set your own in `order` in `data/catalogue.js`.
- Use `.mp4` (H.264 + AAC) so every browser can play it. iPhone/QuickTime `.MOV` files are usually
  HEVC, which Firefox and many Windows/Android browsers cannot play.

Add, rename or remove folders and refresh the page - no code change needed.

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
| Micro-drama folder + per-series details | `data/catalogue.js` |
| Home work grid: tabs, titles, hidden, order | `data/work.js` |
| Home hero | `components/HomeHero.js` |
| Home work grid | `components/Work.js` |
| Catalogue grid | `components/Catalogue.js` |
| Full-page watch popup | `components/WatchModal.js` |
| Video player | `components/Player.js` |
