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
| Home | `/` | Hero, ad films, about, contact |
| Micro Drama | `/micro-drama` | Video hero, the micro-drama catalogue, services, about, contact |

"Home" (centre of the top bar) and "Micro Drama" (next to "Work") switch between them; the current page is pink.

## Home page "Ad films"

Built automatically from the videos in `website p upload krne k liye content/homepage`:
first the videos directly in that folder (A-Z), then the videos of each folder inside it
(for example `seekho`). They are shown one under the other, each with its title above it;
tall (vertical) videos also get a short description on their right (`filmNotes` in `data/home.js`).
Titles, hidden videos and the order are set in `data/home.js`.
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
- Video files are not in `/public`. They are streamed by the Worker (`streamResponse` in `lib/api.js`) through
  signed links that expire after 12 hours and only work inside the player on this site. Opening a
  video link in a new tab, "Save link as", `curl`, or embedding it on another site returns 403.
- No website can stop screen recording, and a technical person can still capture what their own
  browser plays. This blocks the normal ways of saving a video.

## Videos from Cloudflare R2

On a live server the videos come from a Cloudflare R2 bucket instead of the folder on this computer.

1. Upload the `md` and `homepage` folders to the bucket, keeping the folders as they are.
2. In the Cloudflare dashboard: R2 -> Manage API tokens -> Create API token, permission
   "Object Read only", for that bucket. Copy the Access Key ID and the Secret Access Key.
3. Put `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` in `.env.local`
   (and in the environment settings of the host when deploying), then restart the site.

Everything else works the same: one folder in `md` = one title, the text file and poster are read
from the bucket too, and the videos are still only reachable through the signed player links.
A new upload shows up on the site within a minute. With the four settings empty, the site reads
the local folders again.

## Putting it live (Cloudflare)

The live site runs on Cloudflare's free plan, next to the R2 bucket that holds the videos:

- **The pages** are plain static files (`next build` writes them to `out/`). Cloudflare serves
  them directly.
- **A small Worker** (`worker/index.js`, logic in `lib/api.js`) answers only `/api/*`: the list of
  videos with their signed links, the videos themselves (read straight from the bucket), and the
  contact form.

```bash
npm run deploy     # builds and publishes; run it again after every change
```

`npm run deploy` reads the Cloudflare deploy token from `.cloudflare.env` (git-ignored). On a new
computer, either copy that file or run `npx wrangler login` once. Settings are in `wrangler.jsonc`;
the secret that signs the video links is stored in Cloudflare (`npx wrangler secret put STREAM_SECRET`).

Keep the Worker small: Cloudflare's free plan allows about 10 ms of processing per request, which
is why the site is not run as a full Next.js server there. Adding or changing videos in the
bucket needs no deploy; they show up within a minute.

`npm run dev` works as before on your computer (the `app/api/*/route.dev.js` files stand in for
the Worker, and the `R2_*` keys in `.env.local` are used to read the bucket).

## Enquiry form

Each enquiry is emailed to the address at the top of `app/api/enquiry/route.js`, with the
sender's address as reply-to. It is sent through [FormSubmit](https://formsubmit.co), which needs
no account: the first enquiry makes FormSubmit email that address an "Activate form" link, and
once it is clicked every enquiry is delivered.

Optional: set `RESEND_API_KEY` to send through Resend instead, `ENQUIRY_TO` to change the address,
and `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` to also get each enquiry on Telegram.
The "What are you interested in?" boxes are listed in `data/site.js` (`interests`).

## Where to edit

| What | File |
| --- | --- |
| Site text, services, team, contact links | `data/site.js` |
| Micro-drama folder + per-series details | `data/catalogue.js` |
| Home ad films: folder, titles, descriptions, hidden, order | `data/home.js` |
| Background mesh (every page) | `components/ParticleField.js` |
| Cursor and the words inside it | `components/Cursor.js` (`data-cursor="..."` on a button sets its word) |
| "80 new IPs" band and its countdown date | `data/site.js` (`ipDrop`) |
| Studio section: struck-through list and statement | `data/site.js` (`studio`) |
| Home hero | `components/HomeHero.js` |
| Home ad films | `components/AdFilms.js` |
| Catalogue grid | `components/Catalogue.js` |
| Full-page watch popup | `components/WatchModal.js` |
| Video player | `components/Player.js` |
