// All editable copy lives here.
export const site = {
  name: "BRANDS ON STEROIDS", // replace with logo later (see components/Nav.js)
  tagline: "AI micro-drama studio",
  heroLine1: "AI micro-drama",
  heroLine2: "people actually",
  heroAccent: "binge.",
  heroText:
    "We produce AI-native micro-dramas, branded series and on-demand video for studios, platforms and brands - from script to final cut.",
  email: "hello@brandsonsteroids.com", // shown on the site; form enquiries go here too (lib/api.js)
  whatsapp: "https://wa.me/919713030042", // opens a WhatsApp chat with +91 97130 30042
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/brandsonsteroids" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/saransh-yadav-ba2105185" },
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
  // chips under the hero: [label, link, second line]. A chip with a second line is featured:
  // a big card on phones (same colours as the other chips). Put it first.
  chips: [
    ["Micro drama", "/micro-drama", "Original IPs · Watch now"],
    ["Ad films", "#work"],
    ["AI film making", "#work"],
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
export const interests = ["Ad films", "On-demand AI video production", "Bulk AI micro-drama platform", "AI branded content", "Sponsored micro-drama series"];

// The "Other services" dropdown under those boxes
export const otherServices = ["Brand identity", "Personal brand", "Brand world", "Brand strategy", "Go-to-market strategy", "Meta ads", "Pre & post production"];

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

// Home page "What we make": three cards. [title, text, link, link text, icon]
export const offerings = {
  label: "Built on purpose, driven by creativity",
  line: "AI video production,",
  accent: "end to end.",
  text: "From the first idea to the final frame: creative direction, AI-native production and cinematic finishing, for brands, platforms and studios that want work people choose to watch.",
  cards: [
    ["AI Ad Films", "TV-grade commercials, social campaigns, product launches and brand films, built for a feed-first audience.", "/#work", "See the ad films", "spark"],
    ["AI Filmmaking", "Narrative shorts, concept trailers, IP development and previs: visual storytelling from script to screen.", "#contact", "Start a project", "clap"],
    ["AI Micro-dramas", "Binge-built vertical series with consistent characters, made at volume for platforms and their audiences.", "/micro-drama", "Watch the catalogue", "phone"],
  ],
};

// "Full-stack production" - the three stages. [title, text, icon]
export const pipeline = {
  line: "Full-stack production,",
  accent: "with GenAI.",
  text: "One integrated pipeline where AI multiplies human craft: faster turnarounds, consistent characters and worlds, and a finish built for every screen.",
  stages: [
    ["Pre-production", "Concepts, scripts, storyboards and previs, explored with GenAI so you see the film before it is made.", "script"],
    ["GenAI production", "Shots created with state-of-the-art models and AI + VFX hybrid pipelines, directed frame by frame.", "spark"],
    ["Post-production", "Edit, sound, grade and finishing, so every frame is ready for every screen, from phone to cinema.", "screen"],
  ],
};

// Questions and answers (also given to Google as an FAQ). [question, answer]
export const faq = [
  ["Is this production-ready, or just AI art?", "Production-ready. Storyboards, key visuals, films and campaigns are delivered in the formats real advertising, marketing and entertainment pipelines need."],
  ["Can you match our brand style?", "Yes. We build the look around your guidelines, references and past campaigns, so every output feels like you, not like a model's default."],
  ["How fast can you deliver?", "Fast, and the scope decides how fast. Concept explorations usually take days, not weeks; full campaigns and series are planned with you up front."],
  ["What AI tools do you use?", "A constantly evolving stack of leading generative models, custom workflows and our own automation. The creative brief picks the tools, never the other way round."],
  ["Do you work with agencies and production houses?", "Yes. We plug into agencies, production companies and in-house teams as an extension of their pipeline."],
  ["Can one idea scale across formats?", "Yes. We build systems, not one-offs: one creative direction becomes films, social cuts, digital ads, OOH and print."],
  ["Can we license your micro-drama IPs?", "Yes. Original micro-drama IPs from our catalogue are available for licensing and sponsorship. Tell us what your platform needs."],
];

// Brands you have worked with, shown as a wall of names on the home page. Leave empty to hide it.
// Each entry: "Brand name", or ["Brand name", "/clients/logo.svg"] to show a logo file from /public/clients.
export const clients = [];

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
  line: "We are an alternate branding studio that treats storytelling and entertainment as the only brand strategy.",
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
