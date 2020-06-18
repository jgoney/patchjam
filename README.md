# patchjam

Patchjam is a patch manager for synthesizers. With it, you can...
 - search and filter your patches
 - drag patches from the browser into a new patch list
 - save the patch list to a new sysex file to be transferred to your synth!

 Currently Patchjam only supports the Yamaha DX7 (and compatible synths, such as [Dexed](https://asb2m10.github.io/dexed/) or [FM8](https://www.native-instruments.com/en/products/komplete/synths/fm8/)), but adding support for other synths is possible.

 Patchjam is currently not optimized for mobile (as the use case doesn't seem to make sense), but it could be if there were sufficient interest.

 ## Usage tips

1. Select the synth you'd like to create a new patch list for (currently only DX7 is supported).
2. Use the search bar to filter the main list by patch name or author.
3. You can drag interesting patches into your new patch list. You can also drag and drop them to reorder them.
4. Once your list is full (32 patches for DX7), click the "DOWNLOAD SYSEX" button to download your sysex.
5. Send your sysex to your synth using your favorite sysex utility and have fun with your new sounds!
6. As a fun extra, click the dice button to generate a new patch list of 32 random patches.
 
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

## License

Patchjam is provided under the MIT License.
