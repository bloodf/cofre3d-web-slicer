/**
 * Orca preset resolution for the browser slicer: vendor JSON presets (`inherits` + `include` chains) flattened and laid
 * over the engine's schema defaults into the full flat config a slice job carries.
 *
 * Adapted from CubbySlicer (https://github.com/JoshTheDerf/cubbyslicer, AGPL-3.0-or-later, pinned at
 * bdf0007bda4d5bc0fe56b34df1e8fb7fdcf234b5): src/presets/inherit.ts, src/presets/resolve.ts, src/presets/variants.ts,
 * src/presets/values.ts and src/presets/orca/catalog.ts (resolveRaw), reduced to one printer + one process + one filament.
 * See public/slicer/NOTICE.md.
 */

import type { ConfigValue, FlatConfig } from './workerProtocol';
export type { ConfigValue, FlatConfig } from './workerProtocol';
export type RawPreset = Record<string, unknown>;

export interface SchemaOption {
  type: string;
  default?: string;
  scope?: string;
  readonly?: boolean;
  enumValues?: string[];
  variant?: 'print' | 'printer' | 'filament';
  variantStride?: number;
}
export interface ConfigSchema { options: Record<string, SchemaOption> }

/** Keys that describe a preset rather than configure the engine. */
const STRUCTURAL_KEYS: ReadonlySet<string> = new Set([
  'name', 'inherits', 'include', 'from', 'instantiation', 'type', 'setting_id', 'version', 'is_custom_defined',
  'renamed_from', 'description', 'alias', 'base_id', 'user_id', 'updated_time', 'filament_id_map',
]);
const NON_ENGINE_KEYS: ReadonlySet<string> = new Set([
  ...STRUCTURAL_KEYS,
  'compatible_printers', 'compatible_printers_condition', 'compatible_prints', 'compatible_prints_condition',
  'inherits_group', 'compatible_machine_expression_group', 'compatible_process_expression_group',
  'different_settings_to_system', 'print_compatible_printers', 'upward_compatible_machine',
]);

const VECTOR_TYPES: ReadonlySet<string> = new Set(['bools', 'ints', 'floats', 'percents', 'floatsOrPercents', 'strings', 'points']);
const isVector = (type: string | undefined): boolean => !!type && VECTOR_TYPES.has(type);

const VARIANT_LAYOUT = {
  print: { id: 'print_extruder_id', variant: 'print_extruder_variant' },
  printer: { id: 'printer_extruder_id', variant: 'printer_extruder_variant' },
  filament: { id: 'filament_self_index', variant: 'filament_extruder_variant' },
} as const;
type Family = keyof typeof VARIANT_LAYOUT;

const asList = (v: ConfigValue | undefined): string[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const clone = (v: ConfigValue): ConfigValue => (Array.isArray(v) ? v.slice() : v);

// ---- values ------------------------------------------------------------------------------

function unescapeStrings(s: string): string[] {
  if (s === '') return [];
  const out: string[] = [];
  let i = 0;
  while (i <= s.length) {
    let cur = '';
    if (s[i] === '"') {
      i++;
      while (i < s.length && s[i] !== '"') {
        if (s[i] === '\\' && i + 1 < s.length) {
          const n = s[i + 1];
          cur += n === 'n' ? '\n' : n === 'r' ? '\r' : n === 't' ? '\t' : n;
          i += 2;
        } else cur += s[i++];
      }
      i++;
      while (i < s.length && s[i] !== ';') i++;
    } else while (i < s.length && s[i] !== ';') cur += s[i++];
    out.push(cur);
    if (i >= s.length) break;
    i++;
    if (i === s.length) { out.push(''); break; }
  }
  return out;
}

function splitVector(type: string, raw: string): string[] {
  if (type === 'strings') return unescapeStrings(raw);
  return raw.trim() === '' ? [] : raw.split(',').map(x => x.trim());
}

const parseDefault = (def: SchemaOption): ConfigValue => (isVector(def.type) ? splitVector(def.type, def.default ?? '') : (def.default ?? ''));

function rawToString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? '1' : '0';
  return String(v);
}

function normalizeValue(def: SchemaOption | undefined, v: unknown): ConfigValue {
  if (!def) return Array.isArray(v) ? v.map(rawToString) : rawToString(v);
  if (isVector(def.type)) return Array.isArray(v) ? v.map(rawToString) : splitVector(def.type, rawToString(v));
  if (Array.isArray(v)) return def.type === 'string' || def.type === 'point' || def.type === 'point3' ? v.map(rawToString).join(',') : rawToString(v[0]);
  return rawToString(v);
}

/** Raw JSON values → engine-native strings / string arrays (no schema needed). */
function toPresetValues(raw: RawPreset): FlatConfig {
  const out: FlatConfig = {};
  for (const [k, v] of Object.entries(raw)) {
    if (STRUCTURAL_KEYS.has(k) || v === null || v === undefined || (typeof v === 'object' && !Array.isArray(v))) continue;
    out[k] = Array.isArray(v) ? v.map(x => (typeof x === 'boolean' ? (x ? '1' : '0') : x === null ? '' : String(x))) : typeof v === 'boolean' ? (v ? '1' : '0') : String(v);
  }
  return out;
}

// ---- variants ----------------------------------------------------------------------------

function variantKey(schema: ConfigSchema, key: string): { family: Family; stride: number } | null {
  const def = schema.options[key];
  return def?.variant ? { family: def.variant, stride: def.variantStride ?? 1 } : null;
}

function columnCount(values: FlatConfig, family: Family): number {
  const v = values[VARIANT_LAYOUT[family].variant];
  if (v !== undefined) return Math.max(1, asList(v).length);
  if (family === 'printer' && values.nozzle_diameter !== undefined) return Math.max(1, asList(values.nozzle_diameter).length);
  return 1;
}

function fitLength(v: string[], n: number): string[] {
  if (v.length === n || !v.length) return v;
  return v.length > n ? v.slice(0, n) : [...v, ...new Array<string>(n - v.length).fill(v[0]!)];
}

/** Size every per-variant vector to its table's column count (Preset.cpp extend_default_config_length). */
function normalizeVariantLengths(values: FlatConfig, schema: ConfigSchema): FlatConfig {
  const counts: Partial<Record<Family, number>> = {};
  const out: FlatConfig = { ...values };
  for (const [k, v] of Object.entries(values)) {
    if (!Array.isArray(v)) continue;
    const info = variantKey(schema, k);
    if (!info) continue;
    out[k] = fitLength(v, (counts[info.family] ??= columnCount(values, info.family)) * info.stride);
  }
  return out;
}

// ---- flattening --------------------------------------------------------------------------

/** Looks up a preset of one kind by name (the vendor's own collection first, then shared libraries). */
export type PresetLookup = (name: string) => RawPreset | undefined;

interface Resolved { values: FlatConfig; unpadded: FlatConfig }

/**
 * PresetBundle::resolve_vendor_preset: the resolved `inherits` parent, then each `include`d preset's own resolved values,
 * then the preset's own keys; sized to the preset's variant columns afterwards.
 */
export function resolvePreset(leaf: RawPreset, lookup: PresetLookup, schema: ConfigSchema, path: readonly string[] = []): FlatConfig {
  return resolveRaw(leaf, lookup, schema, path).values;
}

function resolveRaw(leaf: RawPreset, lookup: PresetLookup, schema: ConfigSchema, path: readonly string[]): Resolved {
  const name = typeof leaf.name === 'string' ? leaf.name : '';
  if (name && path.includes(name)) throw new Error(`profile cycle: ${[...path, name].join(' -> ')}`);
  const next = name ? [...path, name] : path;
  let merged: FlatConfig = {};
  const inherits = typeof leaf.inherits === 'string' ? leaf.inherits.trim() : '';
  if (inherits) {
    const parent = lookup(inherits);
    if (!parent) throw new Error(`missing parent profile "${inherits}" of "${name}"`);
    merged = { ...resolveRaw(parent, lookup, schema, next).values };
  }
  const includes = (Array.isArray(leaf.include) ? leaf.include : leaf.include ? [leaf.include] : [])
    .filter((x): x is string => typeof x === 'string' && x.trim() !== '').map(x => x.trim());
  for (const inc of includes) {
    const template = lookup(inc);
    if (!template) throw new Error(`missing included profile "${inc}" of "${name}"`);
    Object.assign(merged, resolveRaw(template, lookup, schema, next).unpadded);
  }
  Object.assign(merged, toPresetValues(leaf));
  return { values: normalizeVariantLengths(merged, schema), unpadded: merged };
}

// ---- final config -------------------------------------------------------------------------

function shapeValues(schema: ConfigSchema, values: FlatConfig): FlatConfig {
  const out: FlatConfig = {};
  for (const [k, v] of Object.entries(values)) {
    const def = schema.options[k];
    if (!def || NON_ENGINE_KEYS.has(k)) continue;
    out[k] = validEnum(def, k, normalizeValue(def, v));
  }
  return out;
}

const ENUM_FALLBACK: Readonly<Record<string, string>> = { sparse_infill_pattern: 'cubic' };

function validEnum(def: SchemaOption, key: string, v: ConfigValue): ConfigValue {
  const allowed = def.enumValues;
  if (!allowed?.length || def.type !== 'enum') return v;
  const fallback = (): string => {
    const f = ENUM_FALLBACK[key];
    if (f && allowed.includes(f)) return f;
    const d = String(def.default ?? '').split(',')[0]!;
    return allowed.includes(d) ? d : allowed[0]!;
  };
  const fix = (x: string): string => (allowed.includes(x) ? x : fallback());
  return Array.isArray(v) ? v.map(fix) : fix(v);
}

function schemaDefaults(schema: ConfigSchema): FlatConfig {
  const out: FlatConfig = {};
  for (const [k, def] of Object.entries(schema.options)) {
    if (def.type === 'none' || def.scope === 'other' || def.readonly || NON_ENGINE_KEYS.has(k)) continue;
    out[k] = parseDefault(def);
  }
  return out;
}

export interface ResolveInput {
  schema: ConfigSchema;
  printer: FlatConfig;
  process: FlatConfig;
  filament: FlatConfig;
  names: { printer: string; process: string; filament: string };
}

/** schema defaults ← printer ← process ← one filament slot (element-wise for the filament's vectors). */
export function resolveConfig(input: ResolveInput): FlatConfig {
  const { schema } = input;
  const defaults = schemaDefaults(schema);
  const out: FlatConfig = {};
  for (const [k, v] of Object.entries(defaults)) out[k] = clone(v);
  const apply = (src: FlatConfig): void => { for (const [k, v] of Object.entries(shapeValues(schema, src))) out[k] = clone(v); };
  apply(input.printer);
  apply(input.process);

  const slot = shapeValues(schema, input.filament);
  const columns = columnCount(input.filament, 'filament');
  const variantTables = !!schema.options.filament_self_index;
  const keys = new Set(Object.keys(slot));
  for (const [k, def] of Object.entries(schema.options)) if (def.scope === 'filament' && k in defaults) keys.add(k);
  for (const k of keys) {
    const def = schema.options[k];
    if (def && def.scope !== 'filament') { if (k in slot) out[k] = clone(slot[k]!); continue; }
    const dflt = k in defaults ? defaults[k] : undefined;
    const own = k in slot ? slot[k] : dflt;
    if (own === undefined) continue;
    if (variantTables && variantKey(schema, k)?.family === 'filament' && isVector(def?.type)) {
      const list = asList(own);
      out[k] = list.length ? fitLength(list, columns) : new Array<string>(columns).fill('');
    } else out[k] = clone(own);
  }
  if (variantTables) out.filament_self_index = new Array<string>(columns).fill('1');

  const colour = asList(input.filament.filament_colour)[0] || asList(input.filament.default_filament_colour)[0] || asList(out.filament_colour)[0] || '#F2754E';
  if (schema.options.filament_colour) out.filament_colour = [colour];
  if (schema.options.filament_multi_colour) out.filament_multi_colour = [colour];
  if (schema.options.filament_colour_type) out.filament_colour_type = ['1'];

  const bed = (schema.options.curr_bed_type?.enumValues ?? []);
  const rawBed = asList(out.default_bed_type)[0]?.trim() ?? '';
  const asNumber = Number(rawBed);
  const bedType = bed.includes(rawBed) ? rawBed : Number.isInteger(asNumber) && asNumber >= 1 && asNumber <= bed.length ? bed[asNumber - 1] : undefined;
  if (schema.options.curr_bed_type && bedType) out.curr_bed_type = bedType;

  if (schema.options.printer_settings_id) out.printer_settings_id = input.names.printer;
  if (schema.options.print_settings_id) out.print_settings_id = input.names.process;
  if (schema.options.filament_settings_id) {
    const def = schema.options.filament_settings_id;
    out.filament_settings_id = isVector(def.type) ? [input.names.filament] : input.names.filament;
  }
  return out;
}
