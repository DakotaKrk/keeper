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

## Next Steps

1. Make the tree structure feel more intentional and organic
2. Develop the album experience into a stronger product identity
3. Add portals for years, people and places
4. Create a soft onboarding flow
5. Add account and metadata storage
6. Add private sharing for selected branches
7. Add print export
