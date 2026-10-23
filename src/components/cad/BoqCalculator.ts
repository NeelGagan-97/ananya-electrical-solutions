import { ResidentialProject, BoqItem } from '../../types/residentialDesigner';

export function calculateProjectBoq(project: ResidentialProject): {
  items: BoqItem[];
  subtotal: number;
  gst18: number;
  grandTotal: number;
  totalConduitLengthMeters: number;
  totalWireLengthMeters: number;
} {
  const dbPt = project.electricalPoints.find((p) => p.type === 'db') || project.electricalPoints[0];
  const ceilingY = 2.85;

  let conduit20mMeters = 0;
  let conduit25mMeters = 0;
  let wire1_5SqMmMeters = 0;
  let wire2_5SqMmMeters = 0;
  let wire4_0SqMmMeters = 0;

  // Calculate conduit and wire runs for each placed point
  project.electricalPoints.forEach((pt) => {
    if (pt.type === 'db' || pt.type === 'earth_pit') return;

    // Manhattan/orthogonal distance from DB to target point
    const dx = Math.abs(pt.x - (dbPt ? dbPt.x : 0));
    const dz = Math.abs(pt.z - (dbPt ? dbPt.z : 0));
    const ceilingHorizontal = dx + dz;
    const verticalDrop = Math.abs(ceilingY - pt.y);
    const runLength = ceilingHorizontal + verticalDrop;

    // Check circuit type
    if (pt.circuitId === 'c4_kitchen_power' || pt.circuitId === 'c5_heavy_ac') {
      conduit25mMeters += runLength;
      // 3 cores (Phase, Neutral, Earth) + 15% slack
      wire4_0SqMmMeters += runLength * 3 * 1.15;
    } else if (pt.circuitId === 'c3_power_sockets' || pt.type === 'geyser_point') {
      conduit25mMeters += runLength;
      wire2_5SqMmMeters += runLength * 3 * 1.15;
    } else {
      conduit20mMeters += runLength;
      wire1_5SqMmMeters += runLength * 3 * 1.15;
    }
  });

  // Minimum allowance if few points
  conduit20mMeters = Math.max(30, Math.round(conduit20mMeters));
  conduit25mMeters = Math.max(20, Math.round(conduit25mMeters));
  wire1_5SqMmMeters = Math.max(90, Math.round(wire1_5SqMmMeters));
  wire2_5SqMmMeters = Math.max(60, Math.round(wire2_5SqMmMeters));
  wire4_0SqMmMeters = Math.max(45, Math.round(wire4_0SqMmMeters));

  // Count devices
  const switchCount = project.electricalPoints.filter((p) => p.type === 'switch_board_6a').length;
  const socketCount = project.electricalPoints.filter((p) => p.type === 'power_socket_16a' || p.type === 'combined_socket_6_16a').length;
  const ledCount = project.electricalPoints.filter((p) => p.type === 'downlight_led').length;
  const fanCount = project.electricalPoints.filter((p) => p.type === 'ceiling_fan').length;
  const acCount = project.electricalPoints.filter((p) => p.type === 'ac_isolator').length;

  const items: BoqItem[] = [
    // 1. Cables
    {
      id: 'cbl_1_5',
      category: 'Cables & Conductors',
      itemCode: 'FRLS-1.5-CU',
      description: '1.5 sq.mm Multi-Strand High Conductivity FRLS Copper Wire (Red/Black/Green)',
      makeBrand: 'Polycab / Finolex IS:694',
      quantity: wire1_5SqMmMeters,
      unit: 'm',
      unitRate: 26,
      amount: wire1_5SqMmMeters * 26
    },
    {
      id: 'cbl_2_5',
      category: 'Cables & Conductors',
      itemCode: 'FRLS-2.5-CU',
      description: '2.5 sq.mm Multi-Strand FRLS Copper Wire for 16A Socket & Geyser Circuits',
      makeBrand: 'Polycab / Finolex IS:694',
      quantity: wire2_5SqMmMeters,
      unit: 'm',
      unitRate: 42,
      amount: wire2_5SqMmMeters * 42
    },
    {
      id: 'cbl_4_0',
      category: 'Cables & Conductors',
      itemCode: 'FRLS-4.0-CU',
      description: '4.0 sq.mm Heavy-Duty FRLS Copper Wire for 1.5T AC & Kitchen Induction',
      makeBrand: 'Polycab / Havells IS:694',
      quantity: wire4_0SqMmMeters,
      unit: 'm',
      unitRate: 68,
      amount: wire4_0SqMmMeters * 68
    },

    // 2. Conduits
    {
      id: 'cnd_20',
      category: 'Conduits & Enclosures',
      itemCode: 'PVC-20-HD',
      description: '20mm Heavy Duty Rigid PVC Electrical Conduit (Medium/High Mechanical Impact)',
      makeBrand: 'Precision / VIP / Sudhakar',
      quantity: conduit20mMeters,
      unit: 'm',
      unitRate: 45,
      amount: conduit20mMeters * 45
    },
    {
      id: 'cnd_25',
      category: 'Conduits & Enclosures',
      itemCode: 'PVC-25-HD',
      description: '25mm Heavy Duty Rigid PVC Conduit for Power and Air Conditioning homeruns',
      makeBrand: 'Precision / Sudhakar',
      quantity: conduit25mMeters,
      unit: 'm',
      unitRate: 58,
      amount: conduit25mMeters * 58
    },
    {
      id: 'cnd_acc',
      category: 'Conduits & Enclosures',
      itemCode: 'PVC-FITTINGS',
      description: 'Conduit Accessories: Deep circular junction boxes, inspection bends, GI saddle clamps',
      makeBrand: 'ISI Certified Assorted',
      quantity: 1,
      unit: 'lot',
      unitRate: 3500,
      amount: 3500
    },

    // 3. Switchgear & Protection
    {
      id: 'db_enc',
      category: 'Switchgear & Protection',
      itemCode: 'DB-8W-TPN',
      description: '8-Way SPN Double Door Metallic Flush DB Enclosure with Din-Rail & Busbars (IP43)',
      makeBrand: 'Schneider Acti9 / Legrand',
      quantity: 1,
      unit: 'nos',
      unitRate: 3200,
      amount: 3200
    },
    {
      id: 'mcb_rccb',
      category: 'Switchgear & Protection',
      itemCode: 'RCCB-40A-30MA',
      description: '40A 30mA 2-Pole Residual Current Circuit Breaker (RCCB) for electrocution protection',
      makeBrand: 'Schneider / L&T / ABB',
      quantity: 1,
      unit: 'nos',
      unitRate: 2850,
      amount: 2850
    },
    {
      id: 'mcb_spd',
      category: 'Switchgear & Protection',
      itemCode: 'SPD-T2-40KA',
      description: 'Type 2 40kA Surge Protection Device (SPD) for lightning and transient spikes',
      makeBrand: 'Schneider / Phoenix Contact',
      quantity: 1,
      unit: 'nos',
      unitRate: 3400,
      amount: 3400
    },
    {
      id: 'mcb_sp',
      category: 'Switchgear & Protection',
      itemCode: 'MCB-SP-10KA',
      description: 'Single Pole Type-C MCBs (6A, 16A, 20A) with 10kA short circuit breaking capacity',
      makeBrand: 'Schneider / Legrand DX3',
      quantity: 8,
      unit: 'nos',
      unitRate: 220,
      amount: 8 * 220
    },

    // 4. Modular Accessories
    {
      id: 'mod_switches',
      category: 'Modular Accessories',
      itemCode: 'MOD-SW-6A',
      description: '6M Modular Polycarbonate Switchboard with 6A Rocker Switches & Neon Indicator',
      makeBrand: 'Legrand Arteor / GM Modular',
      quantity: Math.max(switchCount, 4),
      unit: 'nos',
      unitRate: 650,
      amount: Math.max(switchCount, 4) * 650
    },
    {
      id: 'mod_sockets',
      category: 'Modular Accessories',
      itemCode: 'MOD-SOCK-16A',
      description: '16A / 6A Universal Combined Socket with Child Safety Shutter & Rocker Control',
      makeBrand: 'Legrand / Schneider Vivace',
      quantity: Math.max(socketCount, 4),
      unit: 'nos',
      unitRate: 480,
      amount: Math.max(socketCount, 4) * 480
    },
    {
      id: 'mod_ac_iso',
      category: 'Modular Accessories',
      itemCode: 'ISO-20A-DP',
      description: '20A High Inrush Double Pole AC Isolator Enclosure with Rotary Handle',
      makeBrand: 'Havells / Anchor Roma',
      quantity: Math.max(acCount, 1),
      unit: 'nos',
      unitRate: 850,
      amount: Math.max(acCount, 1) * 850
    },

    // 5. Earthing
    {
      id: 'earth_chem',
      category: 'Earthing & Grounding',
      itemCode: 'EARTH-IS3043',
      description: 'IS:3043 Chemical Earth Electrode (17.2mm × 2m Pure Copper Bonded) + 25kg Bentonite',
      makeBrand: 'Ananya TrueEarth / Ashlok',
      quantity: 1,
      unit: 'set',
      unitRate: 7500,
      amount: 7500
    },
    {
      id: 'earth_tape',
      category: 'Earthing & Grounding',
      itemCode: 'EARTH-TAPE-CU',
      description: '25 × 3 mm Pure Annealed Copper Earth Strip with heavy cast iron inspection pit cover',
      makeBrand: 'IS Certified Grade A',
      quantity: 1,
      unit: 'set',
      unitRate: 3200,
      amount: 3200
    },

    // 6. Installation Labor
    {
      id: 'lbr_chase',
      category: 'Installation & Chasing',
      itemCode: 'LABOR-CHASING',
      description: 'Masonry wall chasing, conduit slot cutting, laying, plaster patching and point wiring',
      makeBrand: 'Ananya Certified Technicians',
      quantity: 1,
      unit: 'lot',
      unitRate: 14500,
      amount: 14500
    },
    {
      id: 'lbr_testing',
      category: 'Installation & Chasing',
      itemCode: 'LABOR-TESTING',
      description: 'DB dressing, Megger insulation resistance testing, loop impedance & earth test report',
      makeBrand: 'Super Grade Licensed Engineer',
      quantity: 1,
      unit: 'lot',
      unitRate: 3500,
      amount: 3500
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
    totalConduitLengthMeters: conduit20mMeters + conduit25mMeters,
    totalWireLengthMeters: wire1_5SqMmMeters + wire2_5SqMmMeters + wire4_0SqMmMeters
  };
}
