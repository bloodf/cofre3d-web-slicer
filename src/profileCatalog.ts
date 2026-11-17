/** The printers the browser slicer supports: real OrcaSlicer 2.5 vendor profiles, resolved at staging time. */
export interface SlicerProfile {
  id: string;
  nozzle: string;
  label: string;
  vendor: string;
  printer: string;
  process: string;
  filament: string;
  /** Material the filament preset prints (shown next to the profile). */
  material: string;
}

export const SLICER_PROFILES: readonly SlicerProfile[] = [
  {
    "id": "bbl-a1-0.4-pla",
    "label": "Bambu Lab A1, 0.4 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab A1 0.4 nozzle",
    "process": "0.20mm Standard @BBL A1",
    "filament": "Generic PLA @BBL A1",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "bbl-a1-0.2-pla",
    "label": "Bambu Lab A1, 0.2 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab A1 0.2 nozzle",
    "process": "0.10mm Standard @BBL A1 0.2 nozzle",
    "filament": "Bambu PLA Basic @BBL A1 0.2 nozzle",
    "material": "PLA",
    "nozzle": "0.2"
  },
  {
    "id": "bbl-a1-0.6-pla",
    "label": "Bambu Lab A1, 0.6 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab A1 0.6 nozzle",
    "process": "0.30mm Strength @BBL A1 0.6 nozzle",
    "filament": "Bambu PLA Basic @BBL A1",
    "material": "PLA",
    "nozzle": "0.6"
  },
  {
    "id": "bbl-a1-0.8-pla",
    "label": "Bambu Lab A1, 0.8 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab A1 0.8 nozzle",
    "process": "0.40mm Standard @BBL A1 0.8 nozzle",
    "filament": "Bambu PLA Basic @BBL A1",
    "material": "PLA",
    "nozzle": "0.8"
  },
  {
    "id": "bbl-p1s-0.4-pla",
    "label": "Bambu Lab P1S, 0.4 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab P1S 0.4 nozzle",
    "process": "0.20mm Standard @BBL X1C",
    "filament": "Generic PLA @BBL P1P",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "bbl-p1s-0.2-pla",
    "label": "Bambu Lab P1S, 0.2 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab P1S 0.2 nozzle",
    "process": "0.10mm Standard @BBL X1C 0.2 nozzle",
    "filament": "Bambu PLA Basic @BBL X1C 0.2 nozzle",
    "material": "PLA",
    "nozzle": "0.2"
  },
  {
    "id": "bbl-p1s-0.6-pla",
    "label": "Bambu Lab P1S, 0.6 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab P1S 0.6 nozzle",
    "process": "0.30mm Standard @BBL X1C 0.6 nozzle",
    "filament": "Bambu PLA Basic @BBL P1S 0.6 nozzle",
    "material": "PLA",
    "nozzle": "0.6"
  },
  {
    "id": "bbl-p1s-0.8-pla",
    "label": "Bambu Lab P1S, 0.8 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab P1S 0.8 nozzle",
    "process": "0.40mm Standard @BBL X1C 0.8 nozzle",
    "filament": "Bambu PLA Basic @BBL X1C 0.8 nozzle",
    "material": "PLA",
    "nozzle": "0.8"
  },
  {
    "id": "bbl-x1c-0.4-pla",
    "label": "Bambu Lab X1 Carbon, 0.4 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab X1 Carbon 0.4 nozzle",
    "process": "0.20mm Standard @BBL X1C",
    "filament": "Bambu PLA Basic @BBL X1C",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "bbl-x1c-0.2-pla",
    "label": "Bambu Lab X1 Carbon, 0.2 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab X1 Carbon 0.2 nozzle",
    "process": "0.10mm Standard @BBL X1C 0.2 nozzle",
    "filament": "Bambu PLA Basic @BBL X1C 0.2 nozzle",
    "material": "PLA",
    "nozzle": "0.2"
  },
  {
    "id": "bbl-x1c-0.6-pla",
    "label": "Bambu Lab X1 Carbon, 0.6 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab X1 Carbon 0.6 nozzle",
    "process": "0.30mm Standard @BBL X1C 0.6 nozzle",
    "filament": "Bambu PLA Basic @BBL X1C 0.6 nozzle",
    "material": "PLA",
    "nozzle": "0.6"
  },
  {
    "id": "bbl-x1c-0.8-pla",
    "label": "Bambu Lab X1 Carbon, 0.8 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab X1 Carbon 0.8 nozzle",
    "process": "0.40mm Standard @BBL X1C 0.8 nozzle",
    "filament": "Bambu PLA Basic @BBL X1C 0.8 nozzle",
    "material": "PLA",
    "nozzle": "0.8"
  },
  {
    "id": "bbl-p1p-0.4-pla",
    "label": "Bambu Lab P1P, 0.4 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab P1P 0.4 nozzle",
    "process": "0.20mm Standard @BBL P1P",
    "filament": "Bambu PLA Basic @BBL P1P",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "bbl-p1p-0.2-pla",
    "label": "Bambu Lab P1P, 0.2 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab P1P 0.2 nozzle",
    "process": "0.10mm Standard @BBL P1P 0.2 nozzle",
    "filament": "Bambu PLA Basic @BBL P1P 0.2 nozzle",
    "material": "PLA",
    "nozzle": "0.2"
  },
  {
    "id": "bbl-p1p-0.6-pla",
    "label": "Bambu Lab P1P, 0.6 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab P1P 0.6 nozzle",
    "process": "0.30mm Standard @BBL P1P 0.6 nozzle",
    "filament": "Bambu PLA Basic @BBL P1P 0.6 nozzle",
    "material": "PLA",
    "nozzle": "0.6"
  },
  {
    "id": "bbl-p1p-0.8-pla",
    "label": "Bambu Lab P1P, 0.8 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab P1P 0.8 nozzle",
    "process": "0.40mm Standard @BBL P1P 0.8 nozzle",
    "filament": "Bambu PLA Basic @BBL P1P",
    "material": "PLA",
    "nozzle": "0.8"
  },
  {
    "id": "bbl-a1-mini-0.4-pla",
    "label": "Bambu Lab A1 mini, 0.4 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab A1 mini 0.4 nozzle",
    "process": "0.20mm Standard @BBL A1M",
    "filament": "Bambu PLA Basic @BBL A1M",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "bbl-a1-mini-0.2-pla",
    "label": "Bambu Lab A1 mini, 0.2 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab A1 mini 0.2 nozzle",
    "process": "0.10mm Standard @BBL A1M 0.2 nozzle",
    "filament": "Bambu PLA Basic @BBL A1M 0.2 nozzle",
    "material": "PLA",
    "nozzle": "0.2"
  },
  {
    "id": "bbl-a1-mini-0.6-pla",
    "label": "Bambu Lab A1 mini, 0.6 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab A1 mini 0.6 nozzle",
    "process": "0.30mm Standard @BBL A1M 0.6 nozzle",
    "filament": "Bambu PLA Basic @BBL A1M",
    "material": "PLA",
    "nozzle": "0.6"
  },
  {
    "id": "bbl-a1-mini-0.8-pla",
    "label": "Bambu Lab A1 mini, 0.8 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab A1 mini 0.8 nozzle",
    "process": "0.40mm Standard @BBL A1M 0.8 nozzle",
    "filament": "Bambu PLA Basic @BBL A1M",
    "material": "PLA",
    "nozzle": "0.8"
  },
  {
    "id": "bbl-h2d-0.4-pla",
    "label": "Bambu Lab H2D, 0.4 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab H2D 0.4 nozzle",
    "process": "0.20mm Standard @BBL H2D",
    "filament": "Bambu PLA Basic @BBL H2D",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "bbl-h2d-0.2-pla",
    "label": "Bambu Lab H2D, 0.2 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab H2D 0.2 nozzle",
    "process": "0.10mm Standard @BBL H2D 0.2 nozzle",
    "filament": "Bambu PLA Basic @BBL H2D 0.2 nozzle",
    "material": "PLA",
    "nozzle": "0.2"
  },
  {
    "id": "bbl-h2d-0.6-pla",
    "label": "Bambu Lab H2D, 0.6 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab H2D 0.6 nozzle",
    "process": "0.30mm Standard @BBL H2D 0.6 nozzle",
    "filament": "Bambu PLA Basic @BBL H2D 0.6 nozzle",
    "material": "PLA",
    "nozzle": "0.6"
  },
  {
    "id": "bbl-h2d-0.8-pla",
    "label": "Bambu Lab H2D, 0.8 mm, PLA",
    "vendor": "BBL",
    "printer": "Bambu Lab H2D 0.8 nozzle",
    "process": "0.40mm Standard @BBL H2D 0.8 nozzle",
    "filament": "Bambu PLA Basic @BBL H2D 0.8 nozzle",
    "material": "PLA",
    "nozzle": "0.8"
  },
  {
    "id": "prusa-mk4-0.25-pla",
    "label": "Prusa MK4, 0.25 mm, PLA",
    "vendor": "Prusa",
    "printer": "Prusa MK4 0.25 nozzle",
    "process": "0.08mm Standard @MK4",
    "filament": "Generic PLA @Prusa MK4",
    "material": "PLA",
    "nozzle": "0.25"
  },
  {
    "id": "prusa-mk4-0.6-pla",
    "label": "Prusa MK4, 0.6 mm, PLA",
    "vendor": "Prusa",
    "printer": "Prusa MK4 0.6 nozzle",
    "process": "0.32mm Standard @MK4",
    "filament": "Generic PLA @Prusa MK4",
    "material": "PLA",
    "nozzle": "0.6"
  },
  {
    "id": "prusa-mk4-0.8-pla",
    "label": "Prusa MK4, 0.8 mm, PLA",
    "vendor": "Prusa",
    "printer": "Prusa MK4 0.8 nozzle",
    "process": "0.40mm Standard @MK4",
    "filament": "Generic PLA @Prusa MK4",
    "material": "PLA",
    "nozzle": "0.8"
  },
  {
    "id": "prusa-mk4-0.4-pla",
    "label": "Prusa MK4, 0.4 mm, PLA",
    "vendor": "Prusa",
    "printer": "Prusa MK4 0.4 nozzle",
    "process": "0.20mm Standard @MK4",
    "filament": "Generic PLA @Prusa MK4",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "prusa-core-one-0.25-pla",
    "label": "Prusa CORE One, 0.25 mm, PLA",
    "vendor": "Prusa",
    "printer": "Prusa CORE One 0.25 nozzle",
    "process": "0.12mm STRUCTURAL @CORE One 0.25",
    "filament": "Prusament PLA @CORE One",
    "material": "PLA",
    "nozzle": "0.25"
  },
  {
    "id": "prusa-core-one-0.3-pla",
    "label": "Prusa CORE One, 0.3 mm, PLA",
    "vendor": "Prusa",
    "printer": "Prusa CORE One 0.3 nozzle",
    "process": "0.16mm STRUCTURAL @CORE One 0.3",
    "filament": "Prusament PLA @CORE One",
    "material": "PLA",
    "nozzle": "0.3"
  },
  {
    "id": "prusa-core-one-0.4-pla",
    "label": "Prusa CORE One, 0.4 mm, PLA",
    "vendor": "Prusa",
    "printer": "Prusa CORE One 0.4 nozzle",
    "process": "0.20mm SPEED @CORE One 0.4",
    "filament": "Prusament PLA @CORE One",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "prusa-core-one-0.5-pla",
    "label": "Prusa CORE One, 0.5 mm, PLA",
    "vendor": "Prusa",
    "printer": "Prusa CORE One 0.5 nozzle",
    "process": "0.20mm SPEED @CORE One 0.5",
    "filament": "Prusament PLA @CORE One",
    "material": "PLA",
    "nozzle": "0.5"
  },
  {
    "id": "prusa-core-one-0.6-pla",
    "label": "Prusa CORE One, 0.6 mm, PLA",
    "vendor": "Prusa",
    "printer": "Prusa CORE One 0.6 nozzle",
    "process": "0.25mm SPEED @CORE One 0.6",
    "filament": "Prusament PLA @CORE One",
    "material": "PLA",
    "nozzle": "0.6"
  },
  {
    "id": "prusa-core-one-0.8-pla",
    "label": "Prusa CORE One, 0.8 mm, PLA",
    "vendor": "Prusa",
    "printer": "Prusa CORE One 0.8 nozzle",
    "process": "0.40mm QUALITY @CORE One 0.8",
    "filament": "Prusament PLA @CORE One",
    "material": "PLA",
    "nozzle": "0.8"
  },
  {
    "id": "creality-k1-0.4-pla",
    "label": "Creality K1, 0.4 mm, PLA",
    "vendor": "Creality",
    "printer": "Creality K1 (0.4 nozzle)",
    "process": "0.20mm Standard @Creality K1 (0.4 nozzle)",
    "filament": "Generic PLA HF @Creality",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "creality-k1-0.6-pla",
    "label": "Creality K1, 0.6 mm, PLA",
    "vendor": "Creality",
    "printer": "Creality K1 (0.6 nozzle)",
    "process": "0.30mm Standard @Creality K1 (0.6 nozzle)",
    "filament": "Generic PLA HF @Creality",
    "material": "PLA",
    "nozzle": "0.6"
  },
  {
    "id": "creality-k1-0.8-pla",
    "label": "Creality K1, 0.8 mm, PLA",
    "vendor": "Creality",
    "printer": "Creality K1 (0.8 nozzle)",
    "process": "0.40mm Standard @Creality K1 (0.8 nozzle)",
    "filament": "Generic PLA HF @Creality",
    "material": "PLA",
    "nozzle": "0.8"
  },
  {
    "id": "creality-ender-3-v3-0.4-pla",
    "label": "Creality Ender-3 V3, 0.4 mm, PLA",
    "vendor": "Creality",
    "printer": "Creality Ender-3 V3 0.4 nozzle",
    "process": "0.20mm Standard @Creality Ender-3 V3",
    "filament": "Generic PLA @Ender-3 V3-all",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "creality-ender-3-v3-0.6-pla",
    "label": "Creality Ender-3 V3, 0.6 mm, PLA",
    "vendor": "Creality",
    "printer": "Creality Ender-3 V3 0.6 nozzle",
    "process": "0.30mm Standard @Creality Ender-3 V3",
    "filament": "Generic PLA @Ender-3 V3-all",
    "material": "PLA",
    "nozzle": "0.6"
  },
  {
    "id": "creality-ender-3-v3-0.8-pla",
    "label": "Creality Ender-3 V3, 0.8 mm, PLA",
    "vendor": "Creality",
    "printer": "Creality Ender-3 V3 0.8 nozzle",
    "process": "0.40mm Standard @Creality Ender-3 V3 0.8 nozzle",
    "filament": "Generic PLA @Ender-3 V3-all",
    "material": "PLA",
    "nozzle": "0.8"
  },
  {
    "id": "sovol-sv06-0.4-pla",
    "label": "Sovol SV06, 0.4 mm, PLA",
    "vendor": "Sovol",
    "printer": "Sovol SV06 0.4 nozzle",
    "process": "0.20mm Standard @Sovol SV06",
    "filament": "Generic PLA @System",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "elegoo-neptune-4-0.4-pla",
    "label": "Elegoo Neptune 4, 0.4 mm, PLA",
    "vendor": "Elegoo",
    "printer": "Elegoo Neptune 4 0.4 nozzle",
    "process": "0.20mm Standard @Elegoo N4 0.4 nozzle",
    "filament": "Elegoo PLA @EN4 Series",
    "material": "PLA",
    "nozzle": "0.4"
  },
  {
    "id": "elegoo-neptune-4-0.2-pla",
    "label": "Elegoo Neptune 4, 0.2 mm, PLA",
    "vendor": "Elegoo",
    "printer": "Elegoo Neptune 4 0.2 nozzle",
    "process": "0.10mm Standard @Elegoo N4 0.2 nozzle",
    "filament": "Elegoo PLA @0.2 nozzle",
    "material": "PLA",
    "nozzle": "0.2"
  },
  {
    "id": "elegoo-neptune-4-0.6-pla",
    "label": "Elegoo Neptune 4, 0.6 mm, PLA",
    "vendor": "Elegoo",
    "printer": "Elegoo Neptune 4 0.6 nozzle",
    "process": "0.30mm Standard @Elegoo N4 0.6 nozzle",
    "filament": "Elegoo PLA @EN4 Series",
    "material": "PLA",
    "nozzle": "0.6"
  },
  {
    "id": "elegoo-neptune-4-0.8-pla",
    "label": "Elegoo Neptune 4, 0.8 mm, PLA",
    "vendor": "Elegoo",
    "printer": "Elegoo Neptune 4 0.8 nozzle",
    "process": "0.40mm Standard @Elegoo N4 0.8 nozzle",
    "filament": "Elegoo PLA @EN4 Series",
    "material": "PLA",
    "nozzle": "0.8"
  },
  {
    "id": "elegoo-neptune-4-1.0-pla",
    "label": "Elegoo Neptune 4, 1.0 mm, PLA",
    "vendor": "Elegoo",
    "printer": "Elegoo Neptune 4 1.0 nozzle",
    "process": "0.50mm Standard @Elegoo N4 1.0 nozzle",
    "filament": "Elegoo PLA @EN4 Series",
    "material": "PLA",
    "nozzle": "1.0"
  }
];
