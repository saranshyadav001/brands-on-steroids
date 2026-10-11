// ---------------------------------------------------------------------------
// HOME PAGE - "WORK" SECTION
//
// The work grid is built automatically from every video in the content folder
// that is NOT inside the micro-drama folder ("md"):
//
//   website p upload krne k liye content/
//     chumbak.mp4                 <- loose videos = the first tab
//     seekho/                     <- each folder = its own tab
//       AC Technician_c9.mp4
//     md/                         <- micro dramas (shown on the Micro Drama page, not here)
//
// Add, rename or remove files and refresh the page - no code change needed.
// A text file with the same name as a video (chumbak.md next to chumbak.mp4) adds
// a title, hook, description and details to its popup - same layout as the
// micro-drama description files.
// ---------------------------------------------------------------------------

// Tab names. The key is the folder name ("" = videos that are not in any folder).
// A folder that is not listed here uses its own name.
export const workTabs = {
  "": "Films",
  seekho: "Seekho",
  "untitled folder": "Concepts",
};

// Titles. The key is the file name without ".mp4". Any video not listed here gets a
// title cleaned up from its file name; files named only with numbers show as "Films 07".
export const workTitles = {
  "SEEING THE FUTURE X @oakley To see the future is the biggest opportunity and responsibility.Conc": "Seeing the Future x Oakley",
  "van husen x nasa saransh": "Van Heusen x NASA",
  "GUIILT HOOK_FINAL 3": "Guilt Hook",
  "nothing concept film": "Nothing - Concept Film",
  "scifi equations surrealism": "Sci-Fi Equations Surrealism",
  // "chumbak": "Chumbak - Festive Film",
};

// Videos to keep off the site. File names without ".mp4".
export const workHidden = [
  // "igexport-DUn8f7vkk1s",
];

// Videos to show first, in this order (file names without ".mp4"). The rest follow A-Z.
export const workFirst = [
  // "van husen x nasa saransh",
];
