# Courbe du Dragon

A small JavaScript canvas app that draws a dragon curve using recursively generated turns: `1` for right and `0` for left.

## Run locally

Requires Node.js 20.19+ or 22.12+ (Vite 7 requirement), and npm.

From this project's directory (`exercices/courbe-dragon`), run:

```sh
npm install
npm run dev
```

Open the local URL printed in the terminal (usually `http://localhost:5173`). Choose an iteration count from 0 to 18, click **Dessiner** to draw, or **Effacer** to clear the canvas.

## Production build

```sh
npm run build
npm run preview
```

The build is generated in `dist/`. The preview command serves that build locally at the URL printed in the terminal.
