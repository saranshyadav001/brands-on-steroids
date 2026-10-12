// All editable copy lives here.
export const site = {
  name: "BRANDS ON STEROIDS", // replace with logo later (see components/Nav.js)
  tagline: "AI micro-drama studio",
  heroLine1: "AI micro-drama",
  heroLine2: "people actually",
  heroAccent: "binge.",
  heroText:
    "We produce AI-native micro-dramas, branded series and on-demand video for studios, platforms and brands - from script to final cut.",
  email: "hello@brandsonsteroids.com", // shown on the site (form enquiries go to the address in app/api/enquiry/route.js)
  whatsapp: "https://wa.me/919713030042", // opens a WhatsApp chat with +91 97130 30042
  socials: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
    { label: "YouTube", href: "https://youtube.com/" },
  ],
};

// Home page hero
export const home = {
  note: "\u201cNo more boring ads. Make them feel something.\u201d \u2013 Director\u2019s Note",
  line1: "Stop making",
  struck: "Content.",
  struckNote: "(generic noise \u2715)",
  line2: "Start creating",
  accent: "Culture.",
  hand: "AI-native films people WANT to watch",
  lead: "Brands On Steroids",
  text: "is an AI-native media house creating films, entertainment and internet moments that people can\u2019t stop talking about.",
  cta: "Let\u2019s create something people can\u2019t ignore",
  strip: ["A24 visual benchmark", "0% generic slop", "24fps"],
  // chips under the hero: [label, link]
  chips: [
    ["Social media", "#work"],
    ["AI film making", "#work"],
    ["Micro drama", "/micro-drama"],
    ["Brand entertainment", "#work"],
    ["Corporate shoots", "#work"],
    ["Podcast", "#work"],
  ],
};

// Micro-drama page: the band before the services, with a countdown to `ends`
// (date and time, India time). When it is reached the clock stays at 00.
export const ipDrop = {
  label: "Original IPs",
  count: "80",
  line: "new microdrama original IPs",
  accent: "ready for sale.",
  ends: "2026-11-09T18:00:00+05:30", // 28 days from 12 Oct 2026
};

// "What are you interested in?" boxes in the contact form (more than one can be picked)
export const interests = ["On-demand AI video production", "Bulk AI micro-drama platform", "AI branded content", "Sponsored micro-drama series"];

export const services = [
  {
    n: "01",
    id: "on-demand",
    title: "On-demand AI video production",
    text: "Commissioned videos for studios, platforms and IP owners, handled end to end from scripting to post-production.",
    points: ["Script and storyboard", "AI + human-crafted visuals", "Post-production and delivery"],
  },
  {
    n: "02",
    id: "bulk-microdrama",
    title: "Bulk AI micro-drama platform",
    text: "A production pipeline built to deliver micro-drama episodes at volume, with consistent characters and quality.",
    points: ["Series-scale pipeline", "Character consistency", "Fast episode turnaround"],
  },
  {
    n: "03",
    id: "branded-content",
    title: "AI branded content",
    text: "Branded films, ads and story-led campaigns made to be watched, not skipped.",
    points: ["Concept and scripting", "Cinematic AI production", "Cut-downs for every platform"],
  },
  {
    n: "04",
    id: "sponsored-series",
    title: "Sponsored micro-drama series",
    text: "Place your brand inside our running micro-drama series, woven into the story instead of interrupting it.",
    points: ["Native scene integration", "Product and brand placement", "Recurring presence across episodes"],
  },
];

// Studio section, shown before "The mind behind the frame": the usual brand-strategy
// checklist, struck through, next to what the studio does instead.
export const studio = {
  struck: [
    "Brand Purpose & Vision",
    "Target Audience",
    "Market & Competitor Analysis",
    "Brand Positioning",
    "Brand Mission & Values",
    "Brand Identity",
    "Unique Value Proposition (UVP)",
    "Brand Messaging & Storytelling",
    "Brand Experience",
    "Marketing & Communication Strategy",
    "Brand Awareness & Growth",
    "Measurement & KPIs",
  ],
  line: "We are an alternate branding studio that treats storytelling and entertainment as the",
  accent: "only brand strategy.",
};

// Add more people by adding more lines. Photos live in /public/team (square, face centred).
export const team = [
  {
    name: "Saransh Yadav",
    role: "Founder",
    focus: "Creative direction, AI filmmaking, brand entertainment and brand strategy.",
    bio: "He leads how BOS turns cultural insights into compelling brand worlds, building stories and experiences that make brands impossible to ignore.",
    photo: "/team/saransh-yadav.jpg",
  },
];
