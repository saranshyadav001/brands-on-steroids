// ---------------------------------------------------------------------------
// CATALOGUE SETTINGS
//
// The catalogue is built automatically from the content folder below.
// You do NOT list videos by hand - add, rename or remove folders and refresh.
//
//   md/
//     banta/                      <- one folder = one title (one card in the catalogue)
//       banta-pilot.mp4           <- its video(s)
//       discription.md            <- its text: title, hook, plot, details (see below)
//       poster.jpg                <- optional card picture (otherwise a frame of the video is used)
//     Kalyug ka ant/
//       Kalyug Ka Ant ep1.mp4     <- several videos = episodes. "ep1", "ep 2", "part 3" in the
//       Kalyug ka ant Part ep2.mp4   file name sets the episode number; a file with "trailer"
//       discription.md               in its name is shown first as "Trailer"
//
// The text file (any .md or .txt in the folder) is read like this - every part is optional:
//
//   Title of the series
//   One-line hook.
//
//   Plot paragraphs ...
//
//   Genre · Sci-Fi Thriller · Mystery     <- Genre becomes the chips and the pink card label
//   Format · 9:16 vertical                <- other "Name · value" lines become the details list
//   Status · Pilot complete
//
//   Episode 1: The Garland                <- optional text per episode
//   One-line hook for the episode.
//   What happens in it ...
//
// Supported video files: .mp4 .m4v .webm .mov   (.mp4 / H.264 plays in every browser)
// ---------------------------------------------------------------------------

// Folder that holds the titles, relative to the project root.
export const contentDir = "website p upload krne k liye content/md";

// Optional: the order of the cards. List folder names here to show them first, in this
// order; every title not listed follows in A-Z order. Leave empty for plain A-Z.
export const order = [
  "Rewind Ohio",
  // "Kalyug ka ant",
];

// Optional overrides and extras per title. The key is the folder name.
// Anything set here wins over the text file.
export const seriesInfo = {
  "Narsimah trailer": { title: "Narsimha" }, // the folder has no text file yet
  // "banta": {
  //   title: "BANTA: Hard Reset",
  //   genre: "Sci-Fi Thriller",                  // pink label on the card
  //   logline: "One-line hook.",
  //   plot: "Longer description...",
  //   cast: ["Name One", "Name Two"],            // extra chips
  //   tags: ["Memory", "Guilt"],                 // extra chips
  //   freeEpisodes: 2,                           // episodes after this number show a lock (trailer is always free)
  //   episodes: {                                // per-episode text, keyed by file name
  //     "banta-pilot.mp4": { title: "Hard Reset", tagline: "...", plot: "..." },
  //   },
  // },
};
