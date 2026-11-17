/** The printers the browser slicer supports: real OrcaSlicer 2.5 vendor profiles, resolved at staging time. */
export interface SlicerProfile {
  id: string;
  label: string;
  vendor: string;
  printer: string;
  process: string;
  filament: string;
  /** Material the filament preset prints (shown next to the profile). */
  material: string;
}

export const SLICER_PROFILES: readonly SlicerProfile[] = [
  { id: 'bbl-a1-0.4-pla', label: 'Bambu Lab A1, 0.4 mm, PLA', vendor: 'BBL', printer: 'Bambu Lab A1 0.4 nozzle', process: '0.20mm Standard @BBL A1', filament: 'Generic PLA @BBL A1', material: 'PLA' },
  { id: 'bbl-p1s-0.4-pla', label: 'Bambu Lab P1S, 0.4 mm, PLA', vendor: 'BBL', printer: 'Bambu Lab P1S 0.4 nozzle', process: '0.20mm Standard @BBL X1C', filament: 'Generic PLA @BBL P1P', material: 'PLA' },
];
