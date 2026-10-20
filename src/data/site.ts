export const SITE = {
  name: "Melon Drop Motel",
  short: "MDM",
  url: "https://melondropmotel.com",
  tagline: "Just two idiots, polluting the internet.",
  altTagline: "Two scumbags. One motel TV. Weekly tapes.",
  description:
    "Tyler and Rusty broadcast a comedy podcast from a motel that should've been condemned in 1994. Clips, episodes, and short original tracks — almost every week.",
  fans: "Melon Heads",
  hosts: ["Tyler", "Rusty"] as const,
  youtubeHandle: "@MelonDropPod",
  youtubeUrl: "https://www.youtube.com/@MelonDropPod",
  youtubeChannelId: "UCC4O3kbiiC3uujMVyhd2gqQ",
  podcastRss: "https://anchor.fm/s/1170a405c/podcast/rss",
  spotifyUrl: "https://open.spotify.com/show/0WCpWEgDWCPSxWlxq6PpRa",
  email: "mdmpod69@gmail.com",
  twitchHandle: "melondropmotel",
  twitchUrl: "https://www.twitch.tv/melondropmotel",
  socials: [
    { label: "YouTube", href: "https://www.youtube.com/@MelonDropPod" },
    { label: "Spotify", href: "https://open.spotify.com/show/0WCpWEgDWCPSxWlxq6PpRa" },
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
  { label: "WIKI", to: "/wiki" },
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
    id: "8cAWJz6Lp7Q",
    ep: 31,
    title: "Getting Indigenous with Columbus",
    date: "2026-10-15",
    blurb:
      "Rusty has a bad time at a party. Tyler made a game to cheer him up. We celebrate Indigenous people and their culture. It's a long one so strap in.",
    kind: "episode",
  },
  {
    id: "S_t2LW9bx44",
    ep: 30,
    title: "Slurpee Batter",
    date: "2026-10-06",
    blurb:
      "Yes y'all, we won that shit! Crack Amico has graciously decided to bless us lowly degenerates with a theme song that will hopefully raise the bar on the rest of the show. Don't hold your breath. Rusty decides to give Tyler a primer on black metal for some reason. We also talk AxCx song titles, knife tricks, goodwill bins and Slurpees. Just the type of slop you've come to expect from us. Thanks for being here. Luh u.",
    kind: "episode",
  },
  {
    id: "iGimq9x8qpk",
    ep: 29,
    title: "I'm Talking About Blended Sh*t",
    date: "2026-09-30",
    blurb:
      "This was a long awaited debate for some.. unfortunately it didn't go exactly as planned. We had some fun with it though. The question is... Would you notice if poop was in your smoothie? If so, what percentage of blended sh*t is enough to make you stand up and say, \"HEY, THERE'S POOP IN MY SMOOTHIE!?\" Then, we check out some personal stories and current news articles. Only hard hitting, important, informational topics from us.",
    kind: "episode",
  },
  {
    id: "KCdMXrJCgDU",
    ep: 28,
    title: "Cuddly and Mostly Nude",
    date: "2026-09-24",
    blurb:
      "DREAM DREAM DREAM DREAM DREAM DREAM. Rusty's been snoozing pretty hard, and his dreams show it. The guys ponder the big questions. It's a high energy sleepy episode. Get cozy, and enjoy.",
    kind: "episode",
  },
  {
    id: "OdEDx0C2bC4",
    ep: 27,
    title: "Clean Poops, Dirty Dates",
    date: "2026-09-14",
    blurb:
      "You ready to learn something? You better be. This week, it's nothing but info. Informational as heck, breh. We share some stories, talk about chonies and mocos, and do some learning.",
    kind: "episode",
  },
  {
    id: "KrYGsc-yKHY",
    ep: 26,
    title: "King Hillbilly & Killer Robots",
    date: "2026-09-07",
    blurb:
      "We're talking at you again. Look at us. What a freakin' podcast, Man. This time, we're focused on getting some cash- Or at least, imagining what that'd be like. We take a look at King Hillbilly, who quickly becomes a new favorite for us. Reality starts to set in when we look at how quickly a million dollars can disappear. Obviously, we had to check out some robots to brighten the mood and close out the show.",
    kind: "episode",
  },
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
    date: "2026-08-24",
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
      "Meditation with the guys, beef with Mr. Beef, Grindr trolling bodycam, AI catfishing, and Japanese prison mascots. Corporate life is not going to stick.",
    kind: "episode",
  },
  {
    id: "_whluxjQDe8",
    ep: 21,
    title: "TeresaCore, Propaganda, and Schizophrenia",
    date: "2026-05-08",
    blurb:
      "Rusty's water challenge, getting serious about AI, Iranian Lego propaganda, the cigarette connoisseur, and a brand new Melon Way original.",
    kind: "episode",
  },
  {
    id: "qw2Gao26fsI",
    ep: 20,
    title: "HEART ATTACK 2026",
    date: "2026-03-03",
    blurb: "Rusty has a heart attack and talks at Tyler about it for an hour.",
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
    id: "3948wkp6IR4",
    ep: 16,
    title: "Oops! All Audio!",
    date: "2026-01-07",
    blurb:
      "Congratulations. You've made it to the end of our data fiasco. The absolute finale of it all. A totally and completely... audio only episode. Just like the good ol' days.",
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
    date: "2025-09-20",
    blurb:
      "What up, Melon Heads (Fruit Baskets if you nasty). Cursed MMO Perfect World, middle school, and evidence of past life on Mars. It's a bit of a mess, but it's here.",
    kind: "episode",
  },
  {
    id: "hwu32-L4STk",
    ep: 11,
    title: "Gas Station Tales",
    date: "2025-09-13",
    blurb:
      "What makes a bad gas station customer? Which Breaking Bad character most resembles Rusty? Can Grandma snort some ZYN? Answers are revealed. Secrets become known.",
    kind: "episode",
  },
  {
    id: "b1I5MDZaZwc",
    ep: 10,
    title: "He Brought Soft Serve, I Brought Topics",
    date: "2025-09-05",
    blurb: "Mayhem, soft serve, chemtrails. He brought the ice cream. We brought everything else.",
    kind: "episode",
  },
  {
    id: "CU2SwcUEbg0",
    ep: 9,
    title: "Playing to the Camera (The Long Awaited Return)",
    date: "2025-08-30",
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
    date: "2025-07-04",
    blurb:
      "Yup. It's another round of slop just for you guys. The boyz throw out more random threats, while taking back others.",
    kind: "episode",
  },
  {
    id: "0a_i2re2tZs",
    ep: 6,
    title: "My Big Lesbian Catholic Birthday Weekend",
    date: "2025-06-28",
    blurb: "This episode starts strong, firing off threats to pretty much any and everyone.",
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
    date: "2025-05-29",
    blurb: "Late night tape from the early days of the motel. Midnight. Absolutely.",
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
    id: "PlSLa3_xdo8",
    title: "I've p*ssed my pants under normal circumstances..",
    date: "2026-10-08",
    blurb: "Top notch topics from the crew here",
    kind: "clip",
  },
  {
    id: "ohBI0a8XgUk",
    title: "Getting denied every single episode..",
    date: "2026-10-05",
    blurb:
      "Rusty knows when he wants to segue, and that's just the way it has to be. He just wants it to BREATHE.",
    kind: "clip",
  },
  {
    id: "zjpiVAadU6A",
    title: "I can spot AI use immediately",
    date: "2026-10-03",
    blurb: "The guys take a moment to let people know how to spot AI use. It's obvious.. really..",
    kind: "clip",
  },
  {
    id: "E_U4Txw2B4Q",
    title: "Check out this mean monkey..",
    date: "2026-10-02",
    blurb: "The guys discuss a previous coworker. He’s a little rascal.",
    kind: "clip",
  },
  {
    id: "Ysw1cuzwGOs",
    title: "I'M MAKING OVER HERE",
    date: "2026-01-22",
    blurb: "Classic.",
    kind: "clip",
  },
  {
    id: "9vErOMtjiF8",
    title: "Whatever this is that you're doing.... it sucks.",
    date: "2026-01-13",
    blurb: "Rusty has had ENOUGH. Enjoy the mania- Full episode linked.",
    kind: "clip",
  },
  {
    id: "pLJXvUuFK0Y",
    title: "Sheesh.. How far into this are we?",
    date: "2026-01-12",
    blurb: "Rusty is over it. What's new? Enjoy the mania- Full episode linked.",
    kind: "clip",
  },
  {
    id: "LBbHqHaRHSg",
    title: "Where ya been at, Donald?",
    date: "2025-09-30",
    blurb: "Trump is always in the news, when He's not, it's news. What a dangerous loop",
    kind: "clip",
  },
  {
    id: "NBBhYlYIOw8",
    title: "The Average Korn Concert Experience",
    date: "2025-09-25",
    blurb: "What do you expect when you show up to a performance like this?",
    kind: "clip",
  },
  {
    id: "cpON7HKUb_I",
    title: "What is the UK doing to the sky?",
    date: "2025-09-11",
    blurb:
      "The United Kingdom has an idea to combat climate change, and it's absolutely bonkers. Who approved this??",
    kind: "clip",
  },
  {
    id: "LbTQHQB2kWU",
    title: "It's a labor of love. Hope someone's enjoying it.",
    date: "2025-09-10",
    blurb:
      "The guys use this opportunity to complain some more. We'll figure out an efficient process eventually, but don't expect the whining to stop. Check out the full ep to see the fruits of our labor.",
    kind: "clip",
  },
  {
    id: "8KxX-7c3P7E",
    title: "Rusty's got a big fat secret. What else is he hiding?",
    date: "2025-09-09",
    blurb: "A quick panic reveals a moment of insecurity. It's all in good fun though.",
    kind: "clip",
  },
  {
    id: "IPvhNWM7F4Q",
    title: "We're taking a step in a new direction",
    date: "2025-06-28",
    blurb:
      "We take a walk over to a new website Rusty found. Really something else man. You like Lord of the Rings? This might be the content you're looking for.",
    kind: "clip",
  },
  {
    id: "PfF5j__SnKc",
    title: "Who are the Mighty Macs?",
    date: "2025-06-24",
    blurb:
      "Who are the Mighty Macs, and who's going to stop them? Coach Rush can't get away with this.",
    kind: "clip",
  },
  {
    id: "aElHg4tbA6g",
    title: "The Cannon Bait",
    date: "2025-06-19",
    blurb: "The gang makes a pit stop to talk about marching band",
    kind: "clip",
  },
  {
    id: "iDDEKQwLPHI",
    title: "There's been a situation..",
    date: "2026-03-05",
    blurb: "Sometimes you overdo it. Take it easy this weekend. Rusty sure will be.",
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
    blurb: "Rusty's been training for this one. 16.9 fluid ounces of H2O. Don't try this at home.",
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
  {
    id: "1BrTCaPVaRw",
    title: "36 Chambers of Cancer",
    date: "2025-04-03",
    blurb: "da boyz talk about cancer and planes",
    kind: "clip",
  },
];

/** mdm studio: original music tracks ([MDM: STUDIO] uploads). Never mixed into CLIPS. */
export const TRACKS: Video[] = [
  {
    id: "L-3V7qeLEro",
    title: "Slop is Back",
    date: "2025-12-27",
    blurb:
      "Written at MDM Studios.\nVisually produced by the local artists on Grok. It's free, in case you hadn't been aware. Anyone can drain an ocean.\nDisclaimer:\nThe words/ actions of Melon Boy do not directly reflect the views of the Melon Drop Motel.",
    kind: "track",
  },
  {
    id: "tRIW3z5Qo78",
    title: "Geometry Mash",
    date: "2025-09-23",
    blurb:
      "Written at MDM Studios.\nChill, Lofi, Pysch-Electronic, Deep House, Alternative stuff. Clearly inspired lol.\nWe've used this one for a bit but haven't posted the full track. Check it out.",
    kind: "track",
  },
  {
    id: "VF-sZ8zn330",
    title: "Yellow Meat",
    date: "2025-08-13",
    blurb:
      "Written at MDM Studios.\nChill, Lofi, Pysch-Electronic, Alternative stuff. Mostly ambient. Check it out.",
    kind: "track",
  },
  {
    id: "KtrFXNBNtGg",
    title: "Truth Seeker",
    date: "2025-06-24",
    blurb:
      "Written at MDM Studios.\nChill, Lofi, Pysch-Electronic, Alternative stuff. Mostly ambient. Free for streaming use, please credit Check it out.",
    kind: "track",
  },
  {
    id: "ndr2tLpzn-0",
    title: "Rusty's Headache",
    date: "2025-06-17",
    blurb:
      "Written at MDM Studios.\nChill, Lofi, Pysch-Electronic, Alternative stuff. Check it out.",
    kind: "track",
  },
  {
    id: "nppvmpdu0Zo",
    title: "Flux & Flow",
    date: "2025-06-03",
    blurb:
      "Written at MDM Studios.\nChill, Space-y, Adventure Electronic-Alternative stuff. Check it out.",
    kind: "track",
  },
  {
    id: "FGdIcB-V6g0",
    title: "Crimewave Beat",
    date: "2025-05-27",
    blurb:
      "Written at MDM Studios.\nChill, Beat Cop, Electronic-HipHop stuff. Check it out.",
    kind: "track",
  },
  {
    id: "LeR9rpusudk",
    title: "Orbital Green",
    date: "2025-05-20",
    blurb:
      "Written at MDM Studios.\nChill, Lofi, Pysch-Electronic, Alternative stuff. Check it out.",
    kind: "track",
  },
  {
    id: "IfxPdDNcHGY",
    title: "Grape Soda",
    date: "2025-05-13",
    blurb:
      "Written at MDM Studios.\nChill, Spooky Electronic-HipHop stuff. Check it out.",
    kind: "track",
  },
  {
    id: "Vpu323OI1cA",
    title: "New Guinea Bones",
    date: "2025-04-24",
    blurb:
      "Written at MDM Studios.\nChill Vaporwave-Lofi-Alternative-HipHop stuff. It's a fun one, check it out.",
    kind: "track",
  },
  {
    id: "p4svLmMtkKI",
    title: "Swarm",
    date: "2025-04-17",
    blurb:
      "Written at MDM Studios.\nElectronic-Alternative-Rock stuff. Check it out.",
    kind: "track",
  },
  {
    id: "EuEj2UTgqYk",
    title: "Freeze Dried",
    date: "2025-04-12",
    blurb:
      "Written at MDM Studios.\nChill Electronic-HipHop stuff. Check it out.",
    kind: "track",
  },
  {
    id: "0rQ1yWWimuo",
    title: "PonderBot",
    date: "2025-04-07",
    blurb:
      "Written at MDM Studios.\nChill Vaporwave-Lofi-HipHop stuff. Check it out.",
    kind: "track",
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
