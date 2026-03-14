## Receipt Tracker

A lightweight, browser-based app for tracking receipts. Add purchases, categorize them, and see totals and averages at a glance. Data is stored locally in your browser (no backend, no login).

---

### Features

- **Quick entry**: Date, vendor, category, amount, and optional notes
- **Smart categories**: Groceries, Travel, Subscriptions, Education, and more
- **Filtering**: Search by vendor/notes and filter by category
- **Summary stats**: Count, total, and average for the current filtered view
- **Local storage**: Your data stays in your browser (per device, per browser)
- **Zero backend**: Pure HTML/CSS/JS, can be hosted anywhere

---

### Live demo

If GitHub Pages is enabled for this repo, you can open the app here:

`https://YOUR-GITHUB-USERNAME.github.io/REPO-NAME/`

Replace `YOUR-GITHUB-USERNAME` and `REPO-NAME` with your actual values.

---

### Getting started (local)

1. **Download or clone** this repository.
2. Open the folder in your file explorer.
3. Double-click `index.html` to open it in your browser.

No build step is required.

---

### How it works

- The app is a single-page front-end built with:
  - `index.html` – layout and structure
  - `styles.css` – dark, modern UI
  - `app.js` – logic for adding, deleting, filtering, and summarizing receipts
- Receipts are stored in `localStorage` under a single key, so they persist across browser sessions on the same device.

---

### Notes

- Each browser/device has its own stored data.
- Deleting or clearing browser storage will remove your saved receipts.
