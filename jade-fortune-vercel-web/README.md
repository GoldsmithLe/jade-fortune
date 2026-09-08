# Jade Fortune — Vercel package

Complete static game export with all artwork and four dragon videos. No database, API keys, dependencies, or build step required. Based on the current game revision 6af57e4bad8a0423c9c69400bbc772c5a2c596d6.

## Deploy through GitHub and Vercel

1. Extract this ZIP. Open the jade-fortune-vercel folder.
2. Create a new GitHub repository. Upload the CONTENTS of this folder, keeping dist and tests as folders. vercel.json and README.md should be at the repository root. Do not upload the ZIP itself.
3. In Vercel, choose Add New → Project, connect GitHub, and import that repository.
4. Use Framework Preset: Other. Root Directory: repository root. Output Directory: dist. No Build Command or Install Command is needed; vercel.json already supplies these settings.
5. Deploy and open the production URL Vercel provides.
6. Test that production link in a signed-out/private browser before sending it to friends. If Vercel requests sign-in, review that project's Deployment Protection settings and choose access appropriate for your intended testers.

Official configuration reference: https://vercel.com/docs/builds/configure-a-build

## Alternative: deploy from your Mac terminal

Install Node.js first if needed. Open Terminal in this extracted folder, then run:

```sh
npx vercel login
npx vercel --prod
```

Follow the account/project prompts. Select this folder as the project directory and use the static settings above. These commands upload and deploy to your Vercel account; nothing has been deployed there by preparing this package.

CLI reference: https://vercel.com/docs/cli

## Files

- dist/index.html: game interface
- dist/style.css: mobile layout and visual effects
- dist/game.js: reels, demo credits, payouts, and autoplay
- dist/guardian.js and dist/video-matte.js: dragon video playback and live gray-background removal
- dist/*.webp: web-optimized artwork, including fallback/reference assets used by the stylesheet
- dist/dragon-*.mp4: idle, focus, happy, and excited reactions
- tests/guardian.cjs: playback and payout checks; run node tests/guardian.cjs from this folder
- vercel.json: static deployment configuration

## Notes for friend testing

The game uses demo credits only. Balance resets on reload. No analytics or feedback collection is included. Use a separate form or ask friends for screenshots/screen recordings and their phone/browser details.

Artwork and videos are included locally. The stylesheet optionally loads Cinzel and DM Sans from Google Fonts; fallback fonts display if that service is unavailable. Use a hosted HTTP/HTTPS URL to test video/canvas behavior, rather than double-clicking index.html.

Known limitation: the excited source video clips the horn at some moments. Mobile performance and visual smoothness still need testing on real devices. Source code checks are not a substitute for that test.

To update later, replace the changed files in the connected GitHub repository and let Vercel deploy the new revision.

## Live Vercel deployment

Production URL: https://jade-fortune.vercel.app
Project: jade-fortune, in Goldsmith Le's projects.
Uploaded directly through the Vercel connector. GitHub linking is not configured yet.
Artwork uses WebP quality 88 and dragon videos use 384px H.264 CRF 26 to fit the direct-upload limit. Gameplay is unchanged.
