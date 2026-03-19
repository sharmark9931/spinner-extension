# Fidget Spinner Chrome Extension

A Chrome extension with a fidget spinner that spins by default, speeds up when you click, then slows and stops. The popup also includes a Google apps launcher and an optional **Top sites** tray (frequent sites).

![Demo](docs/spinner-demo.gif)

<p align="center">
  <em>Preview: spinner, <strong>Top sites</strong> dock, and toolbar apps grid. The real extension animates smoothly in Chrome.</em>
</p>

## Features

- **Default idle spin** – Spinner rotates slowly when the popup is open.
- **Click to boost** – Click the spinner to add speed; it then slows down over time.
- **Google apps** – 9-dot menu (top-right) with categorized shortcuts to common Google services.
- **Top sites** – Optional tray at the bottom (toggle on/off); uses Chrome’s top sites. Preference is saved.
- **Themes** – Looks good in dark and light mode.

## How to install

1. Open Chrome and go to `chrome://extensions/`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the `spinner` folder (this project).
4. Pin the extension and click its icon to open the spinner.

## Icons (required — do not delete)

This project **ships with** `icons/icon16.png`, `icons/icon48.png`, and `icons/icon128.png`.  
`manifest.json` references these paths; **removing the files or the `default_icon` / `icons` entries will break loading** in Chrome.

To use your own artwork, **replace** those three PNGs (same filenames and pixel sizes: 16×16, 48×48, 128×128). Do not remove the `icons` folder.

## Chrome Web Store zip (manifest at root)

The store rejects packages where `manifest.json` is **inside a subfolder** (e.g. `spinner/manifest.json`). That usually happens if you zip the **parent folder** or use **Compress “spinner”** on macOS, which wraps everything in a `spinner/` directory.

**Do this instead:**

1. Open a terminal in the project folder (where `manifest.json` lives).
2. Run:

   ```bash
   chmod +x package-webstore.sh
   ./package-webstore.sh
   ```

3. Upload **`spinner-extension-store.zip`** from the same folder.

Or manually:

```bash
zip -r spinner-extension-store.zip manifest.json popup.html popup.css popup.js google-apps.js frequent-sites.js icons/
```

Check with `unzip -l spinner-extension-store.zip`: the first paths must be `manifest.json`, `popup.html`, … **not** `something/manifest.json`.