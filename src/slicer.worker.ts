/// <reference lib="webworker" />
/**
 * Slicing worker: loads the engine package once, then slices on request. Slicing blocks this worker; the page cancels by
 * terminating it (see client.ts). Messages are typed in workerProtocol.ts.
 */
import { ENGINE_DIR, loadEngineAssets } from './assets';
import { runSlice, type EngineAssets } from './engine';
import { packJob } from './job';
import type { WorkerReply, WorkerRequest } from './workerProtocol';
import { WebSlicerError } from './workerProtocol';

const scope = self as unknown as DedicatedWorkerGlobalScope;
let assets: { dir: string; loaded: Promise<EngineAssets> } | null = null;

function reply(message: WorkerReply, transfer: Transferable[] = []): void { scope.postMessage(message, transfer); }

async function slice(request: Extract<WorkerRequest, { type: 'slice' }>): Promise<void> {
  try {
    reply({ type: 'progress', id: request.id, percent: 0, message: 'loading' });
    const dir = request.engineDir ?? ENGINE_DIR;
    if (assets?.dir !== dir) assets = { dir, loaded: loadEngineAssets(dir) };
    const pending = assets;
    pending.loaded.catch(() => { if (assets === pending) assets = null; });
    const loaded = await pending.loaded;
    const packed = packJob(request.config, request.mesh, request.name);
    const result = await runSlice(loaded, packed, p => reply({ type: 'progress', id: request.id, percent: p.percent, message: p.message }));
    const gcode = result.gcode.buffer as ArrayBuffer;
    reply({ type: 'result', id: request.id, gcode, report: result.report, engine: result.engine }, [gcode]);
  } catch (cause) {
    const error = cause instanceof WebSlicerError ? cause : new WebSlicerError('engine-failed', cause instanceof Error ? cause.message : String(cause), { message: cause instanceof Error ? cause.message : String(cause) });
    reply({ type: 'error', id: request.id, code: error.code, message: error.message, params: { ...error.params } });
  }
}

scope.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type === 'slice') void slice(event.data);
});
