# Cofre3D web slicer

AGPL-3.0-or-later browser worker for OrcaSlicer. This directory can be published alone.
`src/slicer.worker.ts` is the entry point. Call it with messages defined in
`src/workerProtocol.ts`. That independently written MIT contract includes the shared
errors and data types; it does not import the engine implementation.

## Sources and build

- OrcaSlicer WASM: https://github.com/JoshTheDerf/orcaslicer-wasm
- OrcaSlicer and profiles: https://github.com/SoftFever/OrcaSlicer
- Earlier upstreams: https://github.com/prusa3d/PrusaSlicer and https://github.com/slic3r/Slic3r
- CubbySlicer: https://github.com/JoshTheDerf/cubbyslicer at
  `bdf0007bda4d5bc0fe56b34df1e8fb7fdcf234b5`.
  `src/engine.ts`, `job.ts` and `profileResolve.ts` adapt its worker and preset code.
  See `public/NOTICE.md` for the upstream file mapping.

The staged `public/wasm`, `public/profiles`, `public/engine.json` and `public/LICENSE`
are part of this package's corresponding source distribution, including the exact
engine binaries and resolved configurations used by the worker. `engine.json` records
artifact hashes and the download origin. The upstream repositories above contain
the native engine sources and build instructions.

Install Bun, then run `bun run scripts/stage-engine.ts` to fetch the engine and
resolve the catalog profiles. No dependency installation is required. The default
origin is the CubbySlicer deployment; `--origin URL` overrides it. Serve `public/`
at `/slicer/`, and bundle `src/slicer.worker.ts` as a module worker using a
TypeScript-capable bundler. Post a `slice` request with a flat config and mesh;
the worker replies with progress, G-code bytes and the engine report.

In Cofre3D, `apps/shop/scripts/slicer/stage-engine.ts` runs this staging script and
copies the public assets into `apps/shop/public/slicer/`. The Shop build copies the
committed package assets again and stamps the served notice and page with
`https://github.com/bloodf/cofre3d-web-slicer/tree/tree-<hash>`, where `<hash>` is
`git rev-parse HEAD:apps/shop/vendor/web-slicer`. The template stays unstamped here
to avoid a self-referential tree hash.

After committing, the repository's `scripts/publish-web-slicer.sh REMOTE` splits
this directory and pushes `main` and `tree-<hash>` atomically. Publish that tag
before deploying the Shop revision. Publishing is a separate operator action.
