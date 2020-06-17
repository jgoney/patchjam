# patchjam

Patchjam is a patch manager for synthesizers. With it, you can...
 - search and filter your patches
 - drag patches from the browser into a new patch list
 - save the patch list to a new sysex file to be transferred to your synth!

## Quickstart

To run:

```bash
docker-compose build
docker-compose up
```

You may need to insert your patches into the database. `scripts/parse_sysex.py` can be helpful for this.

For development:

```bash
npm install            # install dependencies
npm run watch-server   # start the Express server in watch mode
npm run serve          # serve the Vue client in watch mode
```

## Commands

```
npm run serve         # Compiles and hot-reloads for development
npm run build         # Compiles and minifies for production
npm run lint          # Lints and fixes files

npm run build-server  # Compiles server for development production
npm run run-server    # Runs server (once it's built)
npm run watch-server  # Compiles and hot-reloads server for development
```