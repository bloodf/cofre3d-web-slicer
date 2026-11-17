#!/usr/bin/env bun
/**
 * Stage the browser slicer's engine and profiles into public/slicer/ from the public CubbySlicer deployment
 * (https://cubbycad.com/slicer/wasm/orca/, OrcaSlicer 2.5.0 compiled to WebAssembly, bridge ABI 1).
 *
 *   bun run scripts/slicer/stage-engine.ts [--origin <url>]
 *
 * Writes public/slicer/wasm/orca/{slicer.mjs,slicer.wasm,slicer.data,version.json} (single-threaded build) and one
 * fully resolved flat config per supported profile in public/slicer/profiles/<id>.json plus an index.json.
 * The engine files are committed, so this only runs when updating the engine or the profile list.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SLICER_PROFILES } from '../src/profileCatalog';
import { resolveConfig, resolvePreset, type ConfigSchema, type RawPreset } from '../src/profileResolve';

const arg = (name: string): string | undefined => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined; };
const ORIGIN = (arg('--origin') ?? 'https://cubbycad.com/slicer/wasm/orca').replace(/\/$/, '');
const PUBLIC = new URL('../public/', import.meta.url).pathname;
const ENGINE_FILES = ['slicer.mjs', 'slicer.wasm', 'slicer.data', 'version.json'] as const;
const LIBRARY = 'OrcaFilamentLibrary';

async function get(path: string): Promise<ArrayBuffer> {
  const url = `${ORIGIN}/${path.split('/').map(encodeURIComponent).join('/')}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.arrayBuffer();
}
const getJson = async <T>(path: string): Promise<T> => JSON.parse(new TextDecoder().decode(await get(path))) as T;

type Vendor = Record<'machine_list' | 'process_list' | 'filament_list', Array<{ name: string; sub_path: string }>>;

async function collection(vendorId: string, kind: keyof Vendor): Promise<Map<string, RawPreset>> {
  const vendor = await getJson<Vendor>(`profiles/${vendorId}.json`);
  const entries = vendor[kind];
  const out = new Map<string, RawPreset>();
  let next = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (next < entries.length) {
      const entry = entries[next++]!;
      out.set(entry.name, await getJson<RawPreset>(`profiles/${vendorId}/${entry.sub_path}`));
    }
  }));
  return out;
}

mkdirSync(join(PUBLIC, 'wasm/orca'), { recursive: true });
mkdirSync(join(PUBLIC, 'profiles'), { recursive: true });

const hashes: Record<string, string> = {};
for (const file of ENGINE_FILES) {
  const bytes = new Uint8Array(await get(file));
  writeFileSync(join(PUBLIC, 'wasm/orca', file), bytes);
  hashes[file] = createHash('sha256').update(bytes).digest('hex');
  console.log(`engine ${file} ${bytes.byteLength} bytes`);
}
const version = await getJson<{ engine: string; version: string; bridge: number }>('version.json');
if (version.engine !== 'orca' || version.bridge !== 1) throw new Error(`unexpected engine ${JSON.stringify(version)}`);
const schema = await getJson<ConfigSchema>('schema.json');

const libraries = new Map<string, Map<string, Map<string, RawPreset>>>();
async function presets(vendor: string, kind: keyof Vendor): Promise<Map<string, RawPreset>> {
  const byKind = libraries.get(vendor) ?? new Map<string, Map<string, RawPreset>>();
  libraries.set(vendor, byKind);
  const hit = byKind.get(kind);
  if (hit) return hit;
  const loaded = await collection(vendor, kind);
  byKind.set(kind, loaded);
  return loaded;
}

const index = [];
for (const profile of SLICER_PROFILES) {
  const lookupIn = async (kind: keyof Vendor) => {
    const own = await presets(profile.vendor, kind);
    const lib = kind === 'filament_list' ? await presets(LIBRARY, kind) : null;
    return (name: string): RawPreset | undefined => own.get(name) ?? lib?.get(name);
  };
  const find = async (kind: keyof Vendor, name: string): Promise<RawPreset> => {
    const preset = (await lookupIn(kind))(name);
    if (!preset) throw new Error(`${profile.id}: "${name}" not found in ${profile.vendor} ${kind}`);
    return preset;
  };
  const resolve = async (kind: keyof Vendor, name: string) => resolvePreset(await find(kind, name), await lookupIn(kind), schema);
  const config = resolveConfig({
    schema,
    printer: await resolve('machine_list', profile.printer),
    process: await resolve('process_list', profile.process),
    filament: await resolve('filament_list', profile.filament),
    names: { printer: profile.printer, process: profile.process, filament: profile.filament },
  });
  const body = JSON.stringify({ id: profile.id, engine: { engine: version.engine, version: version.version, bridge: version.bridge }, config });
  writeFileSync(join(PUBLIC, 'profiles', `${profile.id}.json`), body);
  index.push({ id: profile.id, keys: Object.keys(config).length, bytes: body.length });
  console.log(`profile ${profile.id}: ${Object.keys(config).length} keys`);
}
writeFileSync(join(PUBLIC, 'engine.json'), `${JSON.stringify({ origin: ORIGIN, ...version, sha256: hashes, profiles: index }, null, 2)}\n`);
