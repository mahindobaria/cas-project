# Plastic-Free Rajkot Website

This version is ready for Netlify and includes a shared online pledge counter.

## Important deployment note

Do **not** publish this using Netlify Drop / drag-and-drop only. Netlify Drop is mainly for static websites and may not build the serverless function or install `@netlify/blobs`, which causes the message: “Sorry, the pledge could not be saved.”

Use **New site from Git** on Netlify so Netlify runs the build, installs dependencies from `package.json`, and deploys the function in `netlify/functions/pledge.js`.

## How it works

- `index.html` is the website.
- `netlify/functions/pledge.js` is a Netlify Function.
- The function stores every pledge in Netlify Blobs.
- The displayed counter is calculated from all saved pledge records, so the latest website version shows the total count from all previous pledges on the same Netlify site.
- No email is sent when someone takes the pledge.

## Publish correctly on Netlify

1. Unzip this project.
2. Upload the full folder to GitHub.
3. In Netlify, choose **Add new site → Import an existing project** / **New site from Git**.
4. Select the GitHub repository.
5. Keep the default settings or use:
   - Build command: `npm run build`
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
6. Deploy.

After deployment, check this URL in your browser:

`https://YOUR-SITE.netlify.app/.netlify/functions/pledge`

If it shows something like `{ "count": 0 }`, the counter backend is working.

Important: The count persists across redeployments/versions of the **same Netlify site**. If you create a completely new Netlify site, it will have a separate database/counter.
