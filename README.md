# Keeper — Life Tree

A local React and React Flow prototype for a premium memory archive.

## Current Direction

- Premium Notion-inspired interface
- Soft life-tree structure
- Organic branch connections
- Clearer node hierarchy
- Calm image and album panels
- Local image uploads
- Search
- Mini-map and zoom
- Browser-based local persistence

## Start

Open Terminal in the project folder and run:

```bash
npm install
npm run dev
```

Then open the local address shown by Vite, usually:

```text
http://localhost:5173
```

## Note

This is still a local prototype.

Images are stored in `localStorage` as compressed data URLs. That works for early testing, but the final product should store high-resolution originals separately.

## Print And Original Download

Keeper should make it easy to turn a digital album into something physical without building a full photo-book editor in the first version.

The MVP flow should be:

1. Open an album.
2. Choose **Print album** or **Download album**.
3. Download the album photos as a ZIP file.
4. Export images in the album's intended order, for example `001.jpg`, `002.jpg`, `003.jpg`.
5. Continue to a recommended photo-printing service.
6. Upload the exported images there and complete the order outside Keeper.

Keeper must preserve original uploaded image files for archive, download and print export. Optimized preview images may be generated for fast browsing, but previews must never replace the originals.

Future export packages may include metadata such as album title, date, place, image captions and story text.

Keeper does not need to handle printing, payments, shipping, print-ready book layouts, bleed files or a complete photo-book editor in the first MVP.

## Next Steps

1. Make the tree structure feel more intentional and organic
2. Develop the album experience into a stronger product identity
3. Add portals for years, people and tags
4. Create a soft onboarding flow
5. Add account and metadata storage
6. Add private sharing for selected branches
7. Add original image storage and ZIP export
8. Add print album guidance
