import type { FlatConfig } from './profileResolve';
import { WebSlicerError, type MeshData } from './workerProtocol';

/**
 * Engine job (docs/ENGINE-CONTRACT.md "Job JSON" of CubbySlicer): the JSON header plus one blob holding the mesh
 * (float32 xyz, then uint32 triangle indices). Adapted from CubbySlicer src/engine/worker/pack.ts; see public/slicer/NOTICE.md.
 */
export interface PackedJob { json: Uint8Array; blob: Uint8Array }

const COLUMN_MAJOR_IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

interface BedBox { minX: number; minY: number; maxX: number; maxY: number; height: number }

export function bedBox(config: FlatConfig): BedBox {
  const points = (Array.isArray(config.printable_area) ? config.printable_area : String(config.printable_area ?? '').split(','))
    .map(p => p.split('x').map(Number) as [number, number])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (points.length < 3) throw new WebSlicerError('unsupported-profile', 'The profile has no printable area.');
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const height = Number(Array.isArray(config.printable_height) ? config.printable_height[0] : config.printable_height);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys), height: Number.isFinite(height) ? height : Infinity };
}

/** The model's footprint must fit the printable box; the engine would otherwise slice something outside the bed. */
export function checkFits(mesh: MeshData, config: FlatConfig): void {
  const bed = bedBox(config);
  const [x0, y0, z0, x1, y1, z1] = mesh.bounds;
  const size = [x1 - x0, y1 - y0, z1 - z0];
  const limit = [bed.maxX - bed.minX, bed.maxY - bed.minY, bed.height];
  if (size.some((s, i) => s > limit[i]!)) {
    const f = (v: number[]) => v.map(n => (Number.isFinite(n) ? n.toFixed(0) : '∞')).join(' × ');
    throw new WebSlicerError('exceeds-bed', `The model is ${f(size)} mm; this printer fits ${f(limit)} mm.`, { size: f(size), limit: f(limit) });
  }
}

/** Bed coordinates: the model centred on the printable area, its lowest point on the plate (dropToBed). */
export function packJob(config: FlatConfig, mesh: MeshData, name: string): PackedJob {
  checkFits(mesh, config);
  const bed = bedBox(config);
  const [x0, y0, , x1, y1] = mesh.bounds;
  const transform = COLUMN_MAJOR_IDENTITY.slice();
  transform[12] = (bed.minX + bed.maxX) / 2 - (x0 + x1) / 2;
  transform[13] = (bed.minY + bed.maxY) / 2 - (y0 + y1) / 2;
  const indexOffset = mesh.positions.byteLength;
  const blob = new Uint8Array(indexOffset + mesh.indices.byteLength);
  blob.set(new Uint8Array(mesh.positions.buffer, mesh.positions.byteOffset, mesh.positions.byteLength), 0);
  blob.set(new Uint8Array(mesh.indices.buffer, mesh.indices.byteOffset, mesh.indices.byteLength), indexOffset);
  const payload = {
    config,
    options: { validate: true, dropToBed: true },
    objects: [{
      name, vertexOffset: 0, vertexCount: mesh.positions.length / 3,
      indexOffset, triangleCount: mesh.indices.length / 3, transform, config: {},
    }],
  };
  return { json: new TextEncoder().encode(JSON.stringify(payload)), blob };
}
