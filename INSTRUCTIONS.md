# Budget Tracker — Setup & Deployment Instructions

Follow these steps in order. Every command is shown exactly as you type it.

---

## STEP 1 — Install Node.js (one-time setup)

Node.js is the engine that runs the app on your computer.

1. Open your web browser and go to: **https://nodejs.org**
2. Click the big green button that says **"LTS"** (Long Term Support)
3. Download the Windows installer (.msi file)
4. Run the installer — click **Next** on every screen, accept defaults
5. When it finishes, **restart your computer**

To confirm Node.js installed correctly:
- Press `Windows key + R`, type `cmd`, press Enter
- In the black window, type: `node --version` and press Enter
- You should see something like `v20.12.0` — any number is fine

---

## STEP 2 — Install App Dependencies

This downloads all the code libraries the app needs (React, charts, etc.).

1. Press `Windows key + R`, type `cmd`, press Enter
2. In the Command Prompt window, type exactly:
   ```
   cd Desktop\Budget-App
   ```
   Press Enter. (This navigates to your Budget-App folder.)

3. Type:
   ```
   npm install
   ```
   Press Enter and wait. You'll see a lot of text scrolling — this is normal. Takes 1–3 minutes.

4. When it's done, type:
   ```
   npm run generate-icons
   ```
   Press Enter. You should see: ✅ Icons generated in public/icons/

---

## STEP 3 — Preview the App Locally

1. In the same Command Prompt window, type:
   ```
   npm run dev
   ```
   Press Enter. You'll see something like:
   ```
   VITE v6.0.3  ready in 500 ms
   ➜  Local:   http://localhost:5173/
   ```

2. Open your web browser and go to: **http://localhost:5173**

3. You'll see the Budget Tracker app with sample data already loaded!

4. To stop the app, go back to Command Prompt and press `Ctrl + C`

**Note:** This local version is for testing only — it only works on your computer.
To use it on your iPhone, you need to deploy it (Step 4).

---

## STEP 4 — Deploy to Vercel (Free Hosting)

Vercel hosts your app online so you can access it from anywhere, including your iPhone.

### 4a — Create a GitHub Account (if you don't have one)
1. Go to **https://github.com** and click "Sign up"
2. Follow the steps to create a free account

### 4b — Install Git
1. Go to **https://git-scm.com/download/win**
2. Download and run the installer — click Next on every screen

### 4c — Upload your app to GitHub
In Command Prompt (still in the Budget-App folder):

```
git init
git add .
git commit -m "Initial Budget Tracker app"
```

Now create a repository on GitHub:
1. Go to **https://github.com** and log in
2. Click the **+** button in the top-right corner → "New repository"
3. Name it: `budget-tracker`
4. Leave everything else as default
5. Click **"Create repository"**

GitHub will show you a page with commands. Copy and paste these two lines from that page:
```
git remote add origin https://github.com/YOUR-USERNAME/budget-tracker.git
git push -u origin main
```
(Replace YOUR-USERNAME with your actual GitHub username)

It will ask for your GitHub username and password — use a **Personal Access Token** for the password:
- Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Click "Generate new token" → check "repo" → Generate
- Copy the token and use it as your password

### 4d — Deploy on Vercel
1. Go to **https://vercel.com** and click "Sign Up"
2. Choose "Continue with GitHub" and log in
3. Click **"Add New Project"**
4. Find `budget-tracker` in the list and click **"Import"**
5. Leave all settings as default — Vercel detects Vite automatically
6. Click **"Deploy"**
7. Wait about 60 seconds for it to build
8. Vercel will give you a URL like: `https://budget-tracker-abc123.vercel.app`

**That's your app URL — save it!** It's live and works everywhere.

---

## STEP 5 — Add to iPhone Home Screen

1. On your iPhone, open **Safari** (must be Safari — Chrome won't work for this)
2. Go to your Vercel URL (e.g. `https://budget-tracker-abc123.vercel.app`)
3. Tap the **Share button** (the square with an arrow pointing up, at the bottom)
4. Scroll down in the menu and tap **"Add to Home Screen"**
5. Change the name to **"Budget"** if you want
6. Tap **"Add"** in the top-right corner

The Budget Tracker icon now appears on your iPhone home screen.
Tap it and it opens full-screen, just like a real app — no browser bar.

**It works offline too!** Once it loads once, it works without internet.

---

## STEP 6 — Updating the App in the Future

When you want changes made to the app (new features, tweaks, etc.):

1. Have Claude Code make the changes to the files in your Budget-App folder
2. Open Command Prompt and navigate to your folder:
   ```
   cd Desktop\Budget-App
   ```
3. Run these commands:
   ```
   git add .
   git commit -m "Describe what changed"
   git push
   ```
4. Vercel automatically detects the push and re-deploys within 60 seconds
5. Refresh the app on your iPhone — changes appear automatically

---

## QUICK REFERENCE

| Task | Command |
|------|---------|
| Start local preview | `npm run dev` |
| Build for production | `npm run build` |
| Regenerate icons | `npm run generate-icons` |
| Push updates to Vercel | `git add . && git commit -m "update" && git push` |

---

## TROUBLESHOOTING

**"npm is not recognized"**
→ Node.js didn't install correctly. Re-run the Node.js installer and restart your computer.

**App won't open on iPhone**
→ Make sure you're using Safari, not Chrome or Firefox.

**"Add to Home Screen" option is missing**
→ Scroll further down in the Share menu — it can be hidden.

**App shows blank white screen**
→ Run `npm run build` locally and check for error messages. Usually a typo in one of the config files.

**Changes not showing after push**
→ On your iPhone, hold down the Budget icon and tap "Edit Home Screen", then re-open from Vercel URL.
   Or try: Settings → Safari → Advanced → Website Data → Delete budget-tracker, then re-open.
