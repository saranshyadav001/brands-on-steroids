// ---------------------------------------------------------------------------
// HOME PAGE - "AD FILMS" SECTION
//
// The section is built automatically from the videos in the folder below:
// first the videos directly inside it (A-Z), then the videos of each folder
// inside it (for example "seekho"). One video under the other, each with its title:
// wide videos have the title above; tall (vertical) and square videos sit on the left
// with the title to their right.
//
//   website p upload krne k liye content/
//     homepage/
//       chumbak.mp4               <- shown, title "Chumbak"
//       nike concept.mp4
//       seekho/                   <- shown after the ones above, title "AC Technician // Seekho"
//         AC Technician.mp4
//
// Add, rename or remove files and refresh the page - no code change needed.
// ---------------------------------------------------------------------------

// Folder that holds the home page videos, relative to the project root.
export const homeDir = "website p upload krne k liye content/homepage";

// Titles. The key is the file name without ".mp4". Any video not listed here gets a
// title made from its file name ("nike concept.mp4" -> "Nike Concept").
export const filmTitles = {
  "van husen x nasa saransh": "Van Heusen x NASA",
  "GUIILT HOOK": "Guilt Hook",
  "luma ai concept film": "Luma AI Concept Film",
  "creator content morning routine": "Creator Content - Morning Routine",
  // "chumbak": "Chumbak - Festive Film",
};

// The pink word shown after the title for videos inside a folder ("// Seekho").
// The key is the folder name. Set a folder to "" to show no word for it.
export const folderLabels = {
  seekho: "Seekho",
};

// Videos to keep off the site. File names without ".mp4".
export const filmsHidden = [
  // "oakley logo collab concept",
];

// Videos to show first, in this order (file names without ".mp4"). The rest follow as described above.
export const filmsFirst = [
  "luma ai concept film",
  "nike concept",
  "nothing buds concept film",
  "Saraya brand entertainment",
  "cadbury lunchbar",
  // from here on the order is a suggestion - move lines up or down to change it
  "van husen x nasa saransh",
  "gucci concept",
  "schiaparelli",
  "chumbak",
  "fashion concept",
  "oakley logo collab concept",
  "gridiron",
  "last person",
  "creator content morning routine",
  "creator content'",
];
