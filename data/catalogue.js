// ---------------------------------------------------------------------------
// CATALOGUE SETTINGS
//
// The catalogue is built automatically from the video files inside `contentDir`.
// You do NOT list videos by hand any more - just drop files in the folder.
//
//   md/
//     Bound by Hatred/          <- a folder  = one series (one card in the catalogue)
//       Trailer.mp4             <- a file with "trailer" in its name is shown first, as "Trailer"
//       Ep 01.mp4               <- every other video = an episode, in name order (1, 2, 3 ...)
//       Ep 02.mp4
//       poster.jpg              <- optional: any image in the folder is used as the card poster
//     Some Single Film.mp4      <- a loose video = its own card with one episode
//
// Supported video files: .mp4 .m4v .webm .mov   (use .mp4 / H.264 for best browser support)
// ---------------------------------------------------------------------------

// Folder that holds the videos, relative to the project root.
export const contentDir = "website p upload krne k liye content/md";

// Optional extra details per series. The key is the folder name (or the file
// name without extension for a loose video). Everything is optional.
export const seriesInfo = {
  // --- your current videos (key = file name without the extension) ---
  "banta-pilot": { title: "Banta", genre: "Pilot" },
  "cold-blood-pilot-h264": { title: "Cold Blood", genre: "Pilot" },
  "elijah-pilot": { title: "Elijah", genre: "Pilot" },
  "girl-at-my-funeral-pilot": { title: "Girl at My Funeral", genre: "Pilot" },
  "hockey-rival-pilot": { title: "Hockey Rival", genre: "Pilot" },
  "house-of-thieves-pilot": { title: "House of Thieves", genre: "Pilot" },
  "love-admiral-pilot": { title: "Love Admiral", genre: "Pilot" },
  "unsupervised-pilot": { title: "Unsupervised", genre: "Pilot" },
  "warrior-pilot": { title: "Warrior", genre: "Pilot" },
  "system-malfunction": { title: "System Malfunction" },
  "the-last-well-ep1": { title: "The Last Well", genre: "Episode 1" },
  "Chacha Chaudhary Draft 13": { title: "Chacha Chaudhary" },
  "Kalyug Ka Ant 1.7 2": { title: "Kalyug Ka Ant", genre: "Part 1" },
  "Kalyug ka ant Part 2 Draft 5": { title: "Kalyug Ka Ant", genre: "Part 2" },
  "Agent Monarch - The Beginning Based on the novel \u201cFaces of Babel- Theurgia Sybernetica.\u201d\u2022\u2022\u2022#cybe": {
    title: "Agent Monarch - The Beginning",
    plot: "Based on the novel \u201cFaces of Babel: Theurgia Sybernetica\u201d.",
  },
  // TODO: these three still show their file names - give them real titles
  "Final Draft 5": { title: "Final Draft 5" },
  "2-Oct-2026-1791497079_0457039": { title: "Untitled 1" },
  "7-Oct-2026-1791497230_8486750": { title: "Untitled 2" },

  // --- every option you can set (all optional) ---
  // "Folder or file name": {
  //   title: "Bound by Hatred",                  // display name (default: the folder / file name)
  //   genre: "Romance drama",                    // small pink label on the card
  //   plot: "Gianna wishes to stay away from Matteo...",
  //   cast: ["Nate Flores", "Rhett Wellington"], // shown as chips
  //   tags: ["Crime Lord", "Possessive"],        // shown as chips
  //   likes: 5500,                               // starting numbers shown under the heart / bookmark
  //   saves: 119700,
  //   freeEpisodes: 11,                          // episodes after this number show a lock (trailer is always free)
  //   episodes: {                                // per-episode text, keyed by file name
  //     "Trailer.mp4": { title: "Official trailer", plot: "..." },
  //   },
  // },
};
