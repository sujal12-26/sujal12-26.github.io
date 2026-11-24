# Sujal Patel — Portfolio

A personal portfolio built with React, TypeScript, and Vite. It includes an About section, a certificate gallery, project cards with detailed views, and contact links.

## Features

- Shows three featured projects on the home page; **View More Projects** opens the full gallery.
- Opens a detailed explanation, project image, and GitHub link for each project.
- Displays selected certificates with a separate page for the full certificate gallery.
- Keeps certificate PDFs and their preview images in `public/certificates/`.

## Run locally

Prerequisite: Node.js.

```bash
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:3000` in a browser.

The `--legacy-peer-deps` option is needed for the current Vite/esbuild dependency versions in this project.

## Build

```bash
npm run build
npm run preview
```
