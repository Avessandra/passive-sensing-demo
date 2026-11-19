# Everyday — Smartphone Usage Simulator

A static HTML/CSS/JavaScript smartphone simulator designed for GitHub Pages.

## Run locally

Open `index.html` in a modern browser, or serve this folder with any static web server.

## Apps

- Messages and Group chat (fictional contacts; no replies are generated)
- Social (six fictional feed posts)
- Browser
- Music
- Calendar

## Session metrics

### App usage

- **Total session duration:** time from page/session start until the user ends and resets the session. It continues while the page is in a background tab.
- **Time per app:** accumulated time while each simulated app is open.
- **Time per app category:** accumulated app time grouped into Messaging, Social Media, Information, Entertainment, and Productivity.
- **Relative time per category:** each category's share of the sum of app time.
- **App sessions:** number of app openings, including the currently open app. Reopening an app creates a new session.
- **Average app session duration:** mean duration of all app-opening sessions, across all apps.
- **Switch duration:** mean time from leaving an app to opening the next app, including a route via the homescreen. Only switches completed within 30 seconds are included.

An app session ends when the user returns to the homescreen or opens another app. Homescreen time is not included in app/category durations.

### On-screen keyboard

- **Typing speed:** characters per minute, counting letters and punctuation but excluding spaces. The rate is calculated over the observed typing span from the first key press to the latest key release.
- **Keystroke duration:** average time each virtual key is held down.
- **Inter-key interval:** average time from releasing one virtual key to pressing the next.
- **Backspace usage:** number of Backspace presses.

## Data handling

All measurements are kept in JavaScript memory only. The simulator does not use cookies, local storage, a database, or a network endpoint for tracking. Reloading the page or selecting **End session & reset data** discards the current measurements.

## Scope

The simulator measures interaction inside this website only. It does not measure participants' actual smartphone use outside the simulated environment.
