# Browser slicer: notices and source

The Cofre3D browser slicer (`/fatiador`) slices STL files on the visitor's device. Nothing is uploaded while slicing.

## What is shipped here

| Files | What | License | Source |
|---|---|---|---|
| `wasm/orca/slicer.mjs`, `slicer.wasm`, `slicer.data`, `version.json` | OrcaSlicer 2.5.0 compiled to WebAssembly (single-threaded build, bridge ABI 1) | AGPL-3.0-or-later | https://github.com/JoshTheDerf/orcaslicer-wasm (the WebAssembly port) and https://github.com/SoftFever/OrcaSlicer (OrcaSlicer, itself derived from Bambu Studio and PrusaSlicer, https://github.com/slic3r/Slic3r) |
| `profiles/*.json` | Printer, process and filament presets of the OrcaSlicer 2.5 vendor library resolved into one flat configuration each (Bambu Lab) | AGPL-3.0-or-later (OrcaSlicer profile library) | https://github.com/SoftFever/OrcaSlicer/tree/main/resources/profiles |
| `LICENSE` | GNU Affero General Public License, version 3 | | https://www.gnu.org/licenses/agpl-3.0.html |

The engine package was copied unmodified from the public CubbySlicer deployment (`https://cubbycad.com/slicer/wasm/orca/`),
the browser slicer at https://github.com/JoshTheDerf/cubbyslicer (AGPL-3.0-or-later). The SHA-256 of every file is in `engine.json`.
`scripts/slicer/stage-engine.ts` fetches it again and rebuilds the profiles.

## Code adapted from CubbySlicer

Pinned upstream commit `bdf0007bda4d5bc0fe56b34df1e8fb7fdcf234b5` of https://github.com/JoshTheDerf/cubbyslicer, AGPL-3.0-or-later:

- `src/engine.ts`: from `src/engine/worker/heap.ts`, `src/engine/worker/runtime.ts`, `src/engine/engine.worker.ts`
- `src/job.ts`: from `src/engine/worker/pack.ts` and `docs/ENGINE-CONTRACT.md`
- `src/profileResolve.ts`: from `src/presets/inherit.ts`, `resolve.ts`, `variants.ts`, `values.ts`, `orca/catalog.ts`

The rest of the slicer (STL reader, worker client, G-code preview, page and component) is written for Cofre3D.

## Source for this deployment

Corresponding source: [cofre3d-web-slicer](__WEB_SLICER_SOURCE_URL__).
The build stamps this link with the committed package tree hash.
