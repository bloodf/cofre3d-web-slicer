import type { EngineAssets } from './engine';
import { WebSlicerError } from './workerProtocol';

/** Where the engine is served from (same origin: the page's CSP allows only 'self' scripts and workers). */
export const ENGINE_DIR = '/slicer/wasm/orca/';
export const PROFILE_DIR = '/slicer/profiles/';

type Fetcher = (input: string) => Promise<Response>;

const missing = (url: string, why: string): WebSlicerError => new WebSlicerError(
  'asset-missing',
  `The slicing engine could not be loaded (${why}). Check your connection and reload; if it keeps failing the site is missing ${url}.`,
  { url, why },
);

async function fetchOk(fetcher: Fetcher, url: string): Promise<Response> {
  let response: Response;
  try { response = await fetcher(url); } catch (cause) { throw missing(url, cause instanceof Error ? cause.message : 'network error'); }
  if (!response.ok) throw missing(url, `HTTP ${response.status}`);
  return response;
}

/**
 * Fetch and compile the engine package under `dir` (absolute URL or path): slicer.mjs (Emscripten glue), slicer.wasm and
 * slicer.data. `fetcher` and `importModule` are injectable for tests.
 */
export async function loadEngineAssets(dir: string = ENGINE_DIR, fetcher: Fetcher = fetch, importModule: (url: string) => Promise<{ default: unknown }> = url => import(/* @vite-ignore */ url)): Promise<EngineAssets> {
  const compile = async (): Promise<WebAssembly.Module> => {
    const url = `${dir}slicer.wasm`;
    return WebAssembly.compile(await (await fetchOk(fetcher, url)).arrayBuffer()).catch((cause: unknown) => {
      throw missing(url, cause instanceof Error ? cause.message : 'invalid WebAssembly');
    });
  };
  const [factory, wasm, data] = await Promise.all([
    importModule(`${dir}slicer.mjs`).then(m => m.default as EngineAssets['factory'], (cause: unknown) => { throw missing(`${dir}slicer.mjs`, cause instanceof Error ? cause.message : 'import failed'); }),
    compile(),
    fetchOk(fetcher, `${dir}slicer.data`).then(r => r.arrayBuffer()),
  ]);
  return { factory, wasm, data, dir };
}
