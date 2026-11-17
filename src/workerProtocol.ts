// SPDX-License-Identifier: MIT
// Shared message contract and data types, written for Cofre3D.
export type ConfigValue = string | string[];
export type FlatConfig = Record<string, ConfigValue>;

/** Limits of what the page accepts: the engine runs in the visitor's browser memory. */
export const STL_MAX_BYTES = 96 * 1024 * 1024;
export const STL_MAX_TRIANGLES = 1_500_000;

export interface MeshData {
  /** xyz triples, mm. */
  positions: Float32Array;
  /** Triangle vertex indices. */
  indices: Uint32Array;
  /** Axis-aligned bounds: [minX, minY, minZ, maxX, maxY, maxZ]. */
  bounds: readonly [number, number, number, number, number, number];
}

export interface SliceRequest {
  config: FlatConfig;
  mesh: MeshData;
  name: string;
}

export interface SliceStats {
  printTimeSec: number;
  filamentMm: number[];
  filamentG: number[];
  layers: number;
  maxZ: number;
}

export interface SliceReport {
  ok: boolean;
  error: string | null;
  warnings: Array<{ code: string; message: string }>;
  stats: SliceStats | null;
}

export type SliceProgress = { percent: number; message: string };

/** What the WebSlicer component hands to the Cofre handoff: the G-code file plus where it came from. */
export interface WebSlicerResult {
  file: File;
  source: {
    /** Name of the STL the visitor loaded; the bytes never leave the device. */
    stlName: string;
    stlBytes: number;
    triangles: number;
  };
  profile: {
    id: string;
    label: string;
    printer: string;
    process: string;
    filament: string;
  };
  engine: { name: 'OrcaSlicer'; version: string; bridge: number; packagedBy: 'CubbySlicer' };
  stats: SliceStats | null;
  warnings: Array<{ code: string; message: string }>;
  /** sha-256 of the G-code bytes, hex. */
  sha256: string;
}

export type WebSlicerErrorCode =
  | 'not-stl' | 'too-large' | 'too-many-triangles' | 'empty-model' | 'unsupported-profile' | 'exceeds-bed'
  | 'asset-missing' | 'engine-failed' | 'worker-unavailable' | 'cancelled';

export class WebSlicerError extends Error {
  /** `params` fill the localized template of `code` (see copy.ts); `message` is the English fallback. */
  constructor(readonly code: WebSlicerErrorCode, message: string, readonly params: Readonly<Record<string, string | number>> = {}) {
    super(message);
    this.name = 'WebSlicerError';
  }
}

export type WorkerRequest = { type: 'slice'; id: number; config: FlatConfig; mesh: MeshData; name: string; engineDir?: string };

export type WorkerReply =
  | { type: 'progress'; id: number; percent: number; message: string }
  | { type: 'result'; id: number; gcode: ArrayBuffer; report: SliceReport; engine: { version: string; bridge: number } }
  | { type: 'error'; id: number; code: WebSlicerErrorCode; message: string; params: Record<string, string | number> };

/** The few Worker members the client uses, so tests can drive it with a fake. */
export interface SlicerWorker {
  postMessage(message: WorkerRequest): void;
  terminate(): void;
  addEventListener(type: 'message', listener: (event: MessageEvent<WorkerReply>) => void): void;
  addEventListener(type: 'error' | 'messageerror', listener: (event: Event | ErrorEvent) => void): void;
}