import { ResidentialLayoutProject, LayoutBoqItem } from '../../types/layoutDesigner';

export function calculateLayoutBoq(project: ResidentialLayoutProject): {
  items: LayoutBoqItem[];
  subtotal: number;
  gst18: number;
  grandTotal: number;
  totalHtCableMeters: number;
  totalLtCableMeters: number;
  totalStreetlightCount: number;
  totalPillarCount: number;
} {
  // Count infrastructure
  const dtrRating = project.meta.transformerRatingKva || 500;
  const pillarCount = Math.max(project.infra.filter((i) => i.type === 'feeder_pillar').length, 4);
  const streetLightCount = Math.max(project.infra.filter((i) => i.type === 'street_light_pole').length, 12);
  const plotCount = project.plots.length || 28;

  // Cable lengths
  const totalRoadLengthMeters = project.roads.reduce((acc, r) => {
    const dx = r.endPoint[0] - r.startPoint[0];
    const dz = r.endPoint[1] - r.startPoint[1];
    return acc + Math.sqrt(dx * dx + dz * dz);
  }, 0);

  const htCableMeters = 80; // Incoming HT to DTR
  const ltCableMeters = Math.round(totalRoadLengthMeters * 2.2) + 120; // Main trunk + branches
  const streetCableMeters = Math.round(totalRoadLengthMeters * 1.5);
  const trenchMeters = Math.round(totalRoadLengthMeters * 1.2);

  const items: LayoutBoqItem[] = [
    // 1. 11kV Substation & Switchgear
    {
      id: 'sub_dtr_pkg',
      category: '11kV Substation & Switchgear',
      itemCode: 'DTR-500KVA-PKG',
      description: `${dtrRating}kVA 11kV/415V Pad-Mounted Package Substation (DTR) with 3-Way SF6 Ring Main Unit (RMU), HT Metering & Distribution Panel (IP54)`,
      makeBrand: 'Schneider Electric / ABB / Toshiba',
      quantity: 1,
      unit: 'set',
      unitRate: dtrRating >= 500 ? 1850000 : 1250000,
      amount: dtrRating >= 500 ? 1850000 : 1250000
    },
    {
      id: 'sub_la_do',
      category: '11kV Substation & Switchgear',
      itemCode: 'HT-LA-DO-SET',
      description: '11kV 10kA Class-1 Polymer Lightning Arresters (3 Nos) and Heavy Duty Drop-Out (DO) Fuses on DP structure',
      makeBrand: 'Oblum / Lamco / Alstom',
      quantity: 1,
      unit: 'set',
      unitRate: 85000,
      amount: 85000
    },

    // 2. Underground HT & LT Cables
    {
      id: 'cbl_ht_300',
      category: 'Underground HT & LT Cables',
      itemCode: 'HT-11KV-3C-300',
      description: '11kV (E) 3C x 300 sq.mm XLPE Insulated Heavy Duty Aluminium Armoured Cable (IS:7098 Pt-2)',
      makeBrand: 'Polycab / Havells / Universal',
      quantity: htCableMeters,
      unit: 'm',
      unitRate: 1850,
      amount: htCableMeters * 1850
    },
    {
      id: 'cbl_lt_240',
      category: 'Underground HT & LT Cables',
      itemCode: 'LT-1.1KV-3.5C-240',
      description: '1.1kV 3.5C x 240 sq.mm XLPE Insulated Aluminium Armoured Cable for Main Layout Spine',
      makeBrand: 'Polycab / Finolex / KEI',
      quantity: ltCableMeters,
      unit: 'm',
      unitRate: 820,
      amount: ltCableMeters * 820
    },
    {
      id: 'cbl_lt_sl_16',
      category: 'Underground HT & LT Cables',
      itemCode: 'LT-1.1KV-4C-16',
      description: '1.1kV 4C x 16 sq.mm Copper Armoured Cable for Automated Streetlight Distribution Loops',
      makeBrand: 'Polycab / Finolex IS:694',
      quantity: streetCableMeters,
      unit: 'm',
      unitRate: 280,
      amount: streetCableMeters * 280
    },

    // 3. Feeder Distribution Pillars
    {
      id: 'fp_400a',
      category: 'Feeder Distribution Pillars',
      itemCode: 'FP-400A-6WAY',
      description: 'Outdoor Weatherproof 400A 6-Way Low Voltage Feeder Distribution Pillar (IP55) with Electrolytic Copper Busbars & HRC DIN Fuses',
      makeBrand: 'L&T / Ananya Custom Built',
      quantity: pillarCount,
      unit: 'nos',
      unitRate: 78000,
      amount: pillarCount * 78000
    },
    {
      id: 'srv_boxes',
      category: 'Feeder Distribution Pillars',
      itemCode: 'PLOT-SRV-BOX',
      description: 'Precast Consumer Service Connection Terminal Loop Box for individual residential plots',
      makeBrand: 'SMC / Polycarbonate IP65',
      quantity: plotCount,
      unit: 'nos',
      unitRate: 4200,
      amount: plotCount * 4200
    },

    // 4. Street Lighting & Illumination
    {
      id: 'sl_pole_7m',
      category: 'Street Lighting & Illumination',
      itemCode: 'POLE-7M-OCT',
      description: '7m Octagonal Hot-Dip Galvanized Steel Street Light Pole (3mm thick, 86 micron zinc) with single outreach curved bracket',
      makeBrand: 'Bajaj / Utkarsh / Valmont',
      quantity: streetLightCount,
      unit: 'nos',
      unitRate: 14500,
      amount: streetLightCount * 14500
    },
    {
      id: 'sl_lum_60w',
      category: 'Street Lighting & Illumination',
      itemCode: 'LED-60W-IP66',
      description: '60W High-Efficiency Die-Cast Aluminium LED Street Light Luminaire (>130 lm/W, 10kV SPD, IP66, 4000K)',
      makeBrand: 'Philips GreenLine / Havells',
      quantity: streetLightCount,
      unit: 'nos',
      unitRate: 5800,
      amount: streetLightCount * 5800
    },
    {
      id: 'sl_timer_panel',
      category: 'Street Lighting & Illumination',
      itemCode: 'PANEL-ASTRO-TIMER',
      description: 'Feeder Pillar Automatic Streetlight Control Panel with Astronomical Clock, Contactor & Energy Meter',
      makeBrand: 'Schneider / L&T',
      quantity: 1,
      unit: 'set',
      unitRate: 45000,
      amount: 45000
    },

    // 5. Civil Trenching & Duct Banks
    {
      id: 'civil_trench',
      category: 'Civil Trenching & Duct Banks',
      itemCode: 'CIVIL-TRENCH-1M',
      description: 'Trench excavation in mixed soil (1.0m depth x 0.6m width), sand cushioning, interlocking RCC warning tiles & backfill compaction',
      makeBrand: 'IS:1255 Code of Practice',
      quantity: trenchMeters,
      unit: 'm',
      unitRate: 650,
      amount: trenchMeters * 650
    },
    {
      id: 'civil_dwc_pipe',
      category: 'Civil Trenching & Duct Banks',
      itemCode: 'PIPE-160MM-DWC',
      description: '160mm Heavy Duty Double Wall Corrugated (DWC) HDPE Cable Ducts for all road crossings',
      makeBrand: 'Rex / Sudhakar / Duraline',
      quantity: 180,
      unit: 'm',
      unitRate: 520,
      amount: 180 * 520
    },

    // 6. Earthing & Safety Systems
    {
      id: 'earth_chem_rod',
      category: 'Earthing & Grounding' as any,
      itemCode: 'EARTH-IS3043-GRID',
      description: 'IS:3043 Maintenance-Free Copper-Bonded Earthing Kit (17.2mm x 3m Pure Copper Bonded Steel Electrode + Carbonaceous Compound) with CI chamber cover',
      makeBrand: 'Ananya TrueEarth / Ashlok',
      quantity: pillarCount + 4,
      unit: 'set',
      unitRate: 8500,
      amount: (pillarCount + 4) * 8500
    },
    {
      id: 'earth_gi_strip',
      category: 'Earthing & Grounding' as any,
      itemCode: 'EARTH-GI-50X6',
      description: '50 x 6 mm Hot-Dip Galvanized Steel Earthing Strip grid interconnecting substation and all feeder pillars',
      makeBrand: 'Tata Steel Grade-A',
      quantity: 350,
      unit: 'm',
      unitRate: 240,
      amount: 350 * 240
    },

    // 7. Statutory Approvals & Commissioning
    {
      id: 'statutory_ceig',
      category: 'Statutory Approvals & Commissioning',
      itemCode: 'STAT-CEIG-BESCOM',
      description: 'CEIG (Chief Electrical Inspectorate) drawing approvals, statutory inspection fees, Bescom power sanction & final commissioning safety certificate',
      makeBrand: 'Ananya Super Grade Licensed Team',
      quantity: 1,
      unit: 'lot',
      unitRate: 245000,
      amount: 245000
    }
  ];

  const subtotal = items.reduce((acc, it) => acc + it.amount, 0);
  const gst18 = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst18;

  return {
    items,
    subtotal,
    gst18,
    grandTotal,
    totalHtCableMeters: htCableMeters,
    totalLtCableMeters: ltCableMeters + streetCableMeters,
    totalStreetlightCount: streetLightCount,
    totalPillarCount: pillarCount
  };
}
