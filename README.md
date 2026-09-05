# Melon Drop Motel

Comedy podcast site for Tyler and Rusty. CRT motel vibe, live YouTube episodes, Twitch player, desk forms.

## Host it on Vercel (recommended)

You need two free accounts: [GitHub](https://github.com/signup) and [Vercel](https://vercel.com/signup) (sign up for Vercel **with GitHub**).

1. Create a new GitHub repository named `melon-drop-motel` (keep it Public or Private).
2. Upload this project (everything except `node_modules`). GitHub Desktop is the easy way if you are not using git in a terminal.
3. Go to [vercel.com/new](https://vercel.com/new), import that repo, click **Deploy**. Leave the defaults.
4. When it finishes, you get a URL like `something.vercel.app`. That is the live motel.
5. In Vercel: **Project → Settings → Domains** → add the domain you bought on Wix.
6. Copy the A / CNAME values Vercel shows into Wix: **Domains → your domain → Manage DNS**.
7. Wait. DNS can take a few hours. Then `yourdomain.com` is this site.

Do not add a database. Do not add environment secrets. Forms already go to the motel inbox.

## Run it on your computer

You need [Node.js 22](https://nodejs.org/) (LTS is fine).

```bash
npm install
npm run dev
```

Then open the address the terminal prints (usually `http://localhost:8080`).

## What you get

- Lobby, Watch, Who, Live, Shop, Desk
- Episodes and clips from the Melon Drop Motel YouTube RSS
- Twitch player + VOD list on Live
- Desk bookings and mailing-list signups go to the motel inbox

Shop is empty on purpose (TV static). Guestbook stays in the browser.

## Build for the web

```bash
npm run build
```
