# DevTools frontend

React frontend for the DevTools API. The supplied DevTools Web App Design and its second revision have been adapted to the existing application, including category pages, tool search, responsive navigation, and a PDF operation catalog with upload, queue management, and downloads.

The second revision adds a dark glass theme across landing, dashboard, categories, tools, and PDF workflows, with cyan/teal accents, ambient gradients, translucent panels, and responsive PDF navigation. The tool catalog also includes local web formatting, JWT decoding, regex testing, and text/JSON comparison.

## Run

```sh
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `.env.local` to use a local backend:

```text
VITE_API_BASE_URL=http://localhost:8080/v1/dev-tool
```

Without this setting the app uses the existing hosted service. Existing tool processing, including PDF and file operations, uses that API; files are uploaded for processing. The new web formatter, JWT decoder, regex tester, and diff checker run locally without uploading inputs.

## Routes

- `#/`: landing page
- `#/app/dashboard`: dashboard
- `#/app/<tool>`: Base64, JSON, hash, text, timestamp, number, escape, UUID, color, file, PDF, web, JWT, regex, or diff tool
- `#/category/<tool>`: category listing
- `#/app/pdf/<operation>`: direct PDF operation workspace

The design's `#/dashboard` and `#/tools/<tool>` links are also accepted. Unknown routes show a 404 page. Hash routing preserves compatibility with static hosting.

## Validation

```sh
npm run lint
npm test
npm run build
```

The landing page and workspace focus on direct tool access. Tool pages show their working controls and results without promotional badges or example sections. API key management is not provided by the service, so navigation exposes its existing API documentation.

Local tools limit inputs to 100,000 characters. The diff checker allows 800 lines per input and ignores object key order in JSON mode. Regex testing runs in a worker with a 1.5-second timeout. JWT decoding does not verify signatures. Code formatting uses dynamically loaded Prettier parsers.
