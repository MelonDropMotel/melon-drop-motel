export const SITE = {
  name: "Melon Drop Motel",
  short: "MDM",
  tagline: "Just two idiots, polluting the internet.",
  altTagline: "Two scumbags. One motel TV. Weekly tapes.",
  description:
    "Tyler and Rusty broadcast a comedy podcast from a motel that should've been condemned in 1994. Clips, episodes, and short original tracks — almost every week.",
  fans: "Melon Heads",
  hosts: ["Tyler", "Rusty"] as const,
  youtubeHandle: "@MelonDropPod",
  youtubeUrl: "https://www.youtube.com/@MelonDropPod",
  youtubeChannelId: "UCC4O3kbiiC3uujMVyhd2gqQ",
  email: "mdmpod69@gmail.com",
  twitchHandle: "melondropmotel",
  twitchUrl: "https://www.twitch.tv/melondropmotel",
  socials: [
    { label: "YouTube", href: "https://www.youtube.com/@MelonDropPod" },
    { label: "Twitch", href: "https://www.twitch.tv/melondropmotel" },
    { label: "Instagram", href: "https://www.instagram.com/melondropmotel/" },
    { label: "X", href: "https://x.com/melondropmotel" },
    { label: "TikTok", href: "https://www.tiktok.com/@melondropmotel" },
    { label: "Reddit", href: "https://www.reddit.com/r/melondropmotel" },
  ],
} as const;

export const NAV = [
  { label: "LOBBY", to: "/" },
  { label: "WATCH", to: "/watch" },
  { label: "WHO", to: "/about" },
  { label: "LIVE", to: "/live" },
  { label: "SHOP", to: "/shop" },
  { label: "DESK", to: "/desk" },
] as const;

export type VideoKind = "episode" | "clip" | "track";

export type Video = {
  id: string;
  ep?: number;
  title: string;
  date: string;
  blurb: string;
  kind: VideoKind;
};

export const EPISODES: Video[] = [
  {
    id: "9kFBfCYKEkA",
    ep: 25,
    title: "Lost in the Backrooms",
    date: "2026-09-02",
    blurb:
      "We've been watching movies on Twitch. Figured it was time to talk about them. Highest quality reviews you've ever watched — Backrooms, Cube, Evil Dead Burn, The Odyssey.",
    kind: "episode",
  },
  {
    id: "G4G_OkkVfR8",
    ep: 24,
    title: "Reading Unreleased CIA Documents",
    date: "2026-08-25",
    blurb:
      "Oh snap. We're back up in yuh. A handwritten note, personally delivered to Tyler's lady. Line by line: CIA, public figures, a massive alien cover-up. Nobody here is safe.",
    kind: "episode",
  },
  {
    id: "IUDC0BmLByk",
    ep: 23,
    title: "The Actors of a Generation",
    date: "2026-06-07",
    blurb:
      "Trump's IMDB page, the government's latest UFO file dump, and Nicolas Cage in Bad Lieutenant. Kinda free-balled this one. Maybe that's the move.",
    kind: "episode",
  },
  {
    id: "CACtbbz931M",
    ep: 22,
    title: "Ersatz Enterprise",
    date: "2026-05-20",
    blurb:
      "Meditation with the boys, beef with Mr. Beef, Grindr trolling bodycam, AI catfishing, and Japanese prison mascots. Corporate life is not going to stick.",
    kind: "episode",
  },
  {
    id: "_whluxjQDe8",
    ep: 21,
    title: "TeresaCore, Propaganda, and Schizophrenia",
    date: "2026-05-09",
    blurb:
      "Rusty's water challenge, getting serious about AI, Iranian Lego propaganda, the cigarette connoisseur, and a brand new Melon Way original.",
    kind: "episode",
  },
  {
    id: "qw2Gao26fsI",
    ep: 20,
    title: "HEART ATTACK 2026",
    date: "2026-03-03",
    blurb:
      "Rusty has a heart attack and talks at Tyler about it for an hour.",
    kind: "episode",
  },
  {
    id: "XS3VScuVidc",
    ep: 19,
    title: "Brotherhood of the Bothersome Bunghole",
    date: "2026-02-07",
    blurb:
      "Collective memory loss, NPC streamers, Amazon love aids, Skyscraper Live, Alex Jones' demonic Labubu, and Tyler's cats destroying the apartment. Incredible.",
    kind: "episode",
  },
  {
    id: "NJbFSPGEn6I",
    ep: 18,
    title: "GILF Hunting",
    date: "2026-01-26",
    blurb:
      "I look at the date every day, dude. Tyler feeds his beef n' cheese addiction. Lots of slop. Yay.",
    kind: "episode",
  },
  {
    id: "FHVos3TNFPc",
    ep: 17,
    title: "BEEF N' CHEESE",
    date: "2026-01-10",
    blurb:
      "CAPS LOCK STUCK. Tyler has lots of beef n' cheese and Rusty hates it and hates this episode.",
    kind: "episode",
  },
  {
    id: "hZyqD3bAd68",
    ep: 15,
    title: "The Nightmare After Christmas",
    date: "2026-01-06",
    blurb:
      "Oh wow these guys are still around. Crazy. In case you couldn't tell, this one came after the holidays and it shows.",
    kind: "episode",
  },
  {
    id: "VLvLD99jqh4",
    ep: 14,
    title: "Mega Desk Mania",
    date: "2025-12-29",
    blurb:
      "Oh wow these guys are still around. Crazy. And thus, our unplanned vacation saga begins.",
    kind: "episode",
  },
  {
    id: "fA5Qfwp6H2k",
    ep: 13,
    title: "Weaving Spiders Come Not Here",
    date: "2025-09-27",
    blurb:
      "Welcome back. To the podcast. That is called... The Melon Drop Motel. Half-birthdays, a cruddy Bohemian Grove documentary, and the usual chaos.",
    kind: "episode",
  },
  {
    id: "1gVNzNAg4w4",
    ep: 12,
    title: "Shout-Out Arturo, We're Talking Aliens",
    date: "2025-09-21",
    blurb:
      "What up, Melon Heads (Fruit Baskets if you nasty). Cursed MMO Perfect World, middle school, and evidence of past life on Mars. It's a bit of a mess, but it's here.",
    kind: "episode",
  },
  {
    id: "hwu32-L4STk",
    ep: 11,
    title: "Gas Station Tales",
    date: "2025-09-14",
    blurb:
      "What makes a bad gas station customer? Which Breaking Bad character most resembles Rusty? Can Grandma snort some ZYN? Answers are revealed. Secrets become known.",
    kind: "episode",
  },
  {
    id: "b1I5MDZaZwc",
    ep: 10,
    title: "He Brought Soft Serve, I Brought Topics",
    date: "2025-09-06",
    blurb:
      "Mayhem, soft serve, chemtrails. He brought the ice cream. We brought everything else.",
    kind: "episode",
  },
  {
    id: "CU2SwcUEbg0",
    ep: 9,
    title: "Playing to the Camera (The Long Awaited Return)",
    date: "2025-08-31",
    blurb:
      "Another ep is finally out. Clearly this was the peak of our editing capabilities. Bad camera work. Certified reunion.",
    kind: "episode",
  },
  {
    id: "ihcbckhin0E",
    ep: 8,
    title: "Eight Great Dates",
    date: "2025-07-17",
    blurb:
      "Hope you're ready... this one's long, and for good reason. Per usual, we're all over the map.",
    kind: "episode",
  },
  {
    id: "ZaGUP9BaApo",
    ep: 7,
    title: "Melting with Friends!",
    date: "2025-07-05",
    blurb:
      "Yup. It's another round of slop just for you guys. The boyz throw out more random threats, while taking back others.",
    kind: "episode",
  },
  {
    id: "0a_i2re2tZs",
    ep: 6,
    title: "My Big Lesbian Catholic Birthday Weekend",
    date: "2025-06-28",
    blurb:
      "This episode starts strong, firing off threats to pretty much any and everyone.",
    kind: "episode",
  },
  {
    id: "1RBP_7dly4c",
    ep: 5,
    title: "Dangerously Horny",
    date: "2025-06-19",
    blurb:
      "Tyler brings his own smut to the table this week, then we message the director in hopes of finding our first sponsor.",
    kind: "episode",
  },
  {
    id: "5Fo0DhUFMpE",
    ep: 4,
    title: "Gollum's Love Spell",
    date: "2025-06-12",
    blurb:
      "A triple feature from hell. Crack-house movies, Bilbo, Gollum, and a banned episode of the Silverman Show.",
    kind: "episode",
  },
  {
    id: "NQLraOirFzY",
    ep: 3,
    title: "Midnight; ABSOLUTELY",
    date: "2025-04-12",
    blurb:
      "Late night tape from the early days of the motel. Midnight. Absolutely.",
    kind: "episode",
  },
  {
    id: "fwPXeLgnzM8",
    ep: 2,
    title: "Disney Gang Violence",
    date: "2025-05-17",
    blurb:
      "Uh yeah, the episode is late. Who can we be blame but the good folks over at Benadryl. Enjoy the slop.",
    kind: "episode",
  },
  {
    id: "T2fa3MlOPWM",
    ep: 1,
    title: "Brother, EUGH!",
    date: "2025-05-08",
    blurb:
      "Writing this just about started a meltdown in both of us. New friends on Reddit, a trip through the gay villages, and general hostility.",
    kind: "episode",
  },
];

export const CLIPS: Video[] = [
  {
    id: "iDDEKQwLPHI",
    title: "There's been a situation..",
    date: "2026-03-05",
    blurb:
      "Sometimes you overdo it. Take it easy this weekend. Rusty sure will be.",
    kind: "clip",
  },
  {
    id: "TQzwL_kAbTE",
    title: "Rusty has a past..",
    date: "2026-05-18",
    blurb: "A little catfishing lore. Don't try this at home.",
    kind: "clip",
  },
  {
    id: "yYgTI8wNMm0",
    title: "Rusty takes on the water bottle chug challenge",
    date: "2026-05-07",
    blurb:
      "Rusty's been training for this one. 16.9 fluid ounces of H2O. Don't try this at home.",
    kind: "clip",
  },
  {
    id: "NOLh9wzeMsA",
    title: "Melon Way — A Passionate Remix",
    date: "2026-05-11",
    blurb: "Short original track. My Way, if My Way lived at the motel.",
    kind: "track",
  },
  {
    id: "Be0c_NYU1hg",
    title: "I don't think this is Spider Noir..",
    date: "2026-06-06",
    blurb: "Nicolas Cage clip. Crack energy. Not the Sony cut.",
    kind: "clip",
  },
];

export const LATEST = EPISODES[0];

export type Product = {
  id: string;
  name: string;
  price: number;
  blurb: string;
  image: string;
  stamp: string;
};

export const PRODUCTS: Product[] = [];

export const PRESS = [
  {
    quote: "I asked them to stop.",
    source: "A manager, probably",
  },
  {
    quote: "I've asked you to turn this off 3 times now.",
    source: "Someone's dad",
  },
  {
    quote: "Two guys. Zero talent.",
    source: "Faithful listener",
  },
];
