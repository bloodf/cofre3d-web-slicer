/**
 * The single-threaded OrcaSlicer WebAssembly engine, the same Emscripten module the CubbySlicer site ships (bridge ABI 1,
 * docs/ENGINE-CONTRACT.md there). Environment-agnostic: the assets are handed in, so a Web Worker and a test runner load the
 * same code. Adapted from CubbySlicer src/engine/worker/{heap,runtime}.ts and engine.worker.ts (AGPL-3.0-or-later); see
 * public/slicer/NOTICE.md.
 *
 * Memory rules kept from upstream: slicer.wasm is compiled once; every slice gets a FRESH instance (heap fragmentation or a
 * trap never carries over); output is copied out of the heap; (ptr, len) pairs are checked against the current heap.
 */
import type { PackedJob } from './job';
import { WebSlicerError, type SliceProgress, type SliceReport } from './workerProtocol';

export const BRIDGE_ABI = 1;

interface EngineModule {
  HEAPU8: Uint8Array;
  HEAPU32: Uint32Array;
  _malloc(n: number): number;
  _free(p: number): void;
  _cs_free(p: number): void;
  _cs_version(): number;
  _cs_slice(job: number, jobLen: number, blob: number, blobLen: number, outG: number, outGLen: number, outR: number, outRLen: number): number;
  UTF8ToString(p: number): string;
}
type Factory = (options: Record<string, unknown>) => Promise<EngineModule>;

export interface EngineAssets {
  factory: Factory;
  wasm: WebAssembly.Module;
  /** Emscripten preload package (slicer.data), read by the engine at slice time. */
  data: ArrayBuffer;
  /** Directory the engine resolves relative files against. */
  dir: string;
}

export interface EngineSliceResult { gcode: Uint8Array; report: SliceReport; engine: { version: string; bridge: number } }

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function copyOut(mod: EngineModule, ptr: number, len: number): Uint8Array {
  const p = ptr >>> 0, n = len >>> 0;
  if (!p || p + n > mod.HEAPU8.byteLength) throw new Error('engine returned an out-of-bounds buffer');
  return mod.HEAPU8.slice(p, p + n);
}

function u32(mod: EngineModule, ptr: number): number {
  const p = ptr >>> 0;
  if (p % 4 !== 0 || p + 4 > mod.HEAPU8.byteLength) throw new Error('engine returned an invalid pointer');
  return mod.HEAPU32[p >>> 2]! >>> 0;
}

function writeIn(mod: EngineModule, bytes: Uint8Array): number {
  const p = mod._malloc(Math.max(1, bytes.byteLength)) >>> 0;
  if (!p) throw new Error('Out of memory in the engine (malloc failed)');
  mod.HEAPU8.set(bytes, p); // read HEAPU8 after malloc: growth replaces the view
  return p;
}

function allocWords(mod: EngineModule, words: number): number {
  const p = mod._malloc(words * 4) >>> 0;
  if (!p) throw new Error('Out of memory in the engine (malloc failed)');
  mod.HEAPU32.fill(0, p >>> 2, (p >>> 2) + words);
  return p;
}

function safeFree(mod: EngineModule, ptr: number, engineOwned = false): void {
  if (!ptr) return;
  try { if (engineOwned) mod._cs_free(ptr); else mod._free(ptr); } catch { /* trapped instance: the caller drops it */ }
}

async function instantiate(assets: EngineAssets, onProgress: (p: SliceProgress) => void): Promise<{ mod: EngineModule; version: { version: string; bridge: number } }> {
  const mod = await assets.factory({
    locateFile: (file: string) => `${assets.dir}${file}`,
    instantiateWasm(imports: WebAssembly.Imports, done: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void) {
      WebAssembly.instantiate(assets.wasm, imports).then(instance => done(instance, assets.wasm));
      return {};
    },
    getPreloadedPackage: (name: string) => (name.endsWith('.data') ? assets.data.slice(0) : undefined),
    print: () => {},
    printErr: () => {},
    csProgress: (percent: number, message: string) => onProgress({ percent, message }),
  });
  let info: unknown = null;
  try { info = JSON.parse(mod.UTF8ToString(mod._cs_version())); } catch { /* reported below */ }
  const bridge = isObject(info) ? info.bridge : undefined;
  if (bridge !== BRIDGE_ABI) {
    throw new WebSlicerError('asset-missing', `The slicing engine speaks bridge ABI ${String(bridge ?? '?')}, this page needs ${BRIDGE_ABI}. Re-stage it with scripts/slicer/stage-engine.ts.`, { url: 'slicer.wasm', why: `bridge ABI ${String(bridge ?? '?')}` });
  }
  return { mod, version: { version: String((info as Record<string, unknown>).version ?? ''), bridge: BRIDGE_ABI } };
}

/** Slice one packed job on a fresh engine instance. Throws WebSlicerError('engine-failed') with the engine's own message. */
export async function runSlice(assets: EngineAssets, job: PackedJob, onProgress: (p: SliceProgress) => void): Promise<EngineSliceResult> {
  const { mod, version } = await instantiate(assets, onProgress);
  const allocs: number[] = [];
  let gPtr = 0, rPtr = 0;
  try {
    const jobPtr = writeIn(mod, job.json); allocs.push(jobPtr);
    const blobPtr = writeIn(mod, job.blob); allocs.push(blobPtr);
    const outs = allocWords(mod, 4); allocs.push(outs);
    const rc = mod._cs_slice(jobPtr, job.json.byteLength, blobPtr, job.blob.byteLength, outs, outs + 4, outs + 8, outs + 12);
    gPtr = u32(mod, outs); rPtr = u32(mod, outs + 8);
    const gLen = u32(mod, outs + 4), rLen = u32(mod, outs + 12);
    let report: SliceReport = { ok: false, error: `The engine returned ${rc} without a report.`, warnings: [], stats: null };
    if (rPtr && rLen) {
      try {
        const parsed: unknown = JSON.parse(new TextDecoder().decode(copyOut(mod, rPtr, rLen)));
        if (isObject(parsed) && typeof parsed.ok === 'boolean' && Array.isArray(parsed.warnings)) report = parsed as unknown as SliceReport;
      } catch { /* keep the default report */ }
    }
    if (rc !== 0 || !report.ok) throw new WebSlicerError('engine-failed', report.error ?? `Slicing failed (code ${rc}).`, { message: report.error ?? `code ${rc}` });
    if (!gPtr || !gLen) throw new WebSlicerError('engine-failed', 'The engine produced no G-code.', { message: 'no G-code' });
    return { gcode: copyOut(mod, gPtr, gLen), report, engine: version };
  } finally {
    safeFree(mod, gPtr, true);
    safeFree(mod, rPtr, true);
    for (const p of allocs) safeFree(mod, p);
  }
}
