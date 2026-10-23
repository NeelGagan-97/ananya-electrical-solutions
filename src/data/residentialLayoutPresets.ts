import { ResidentialLayoutProject } from '../types/layoutDesigner';

/**
 * Workflow A: Greenfield Gated Enclave (New Development)
 * 4.2 Acres, 28 residential plots (30x40 & 40x60 ft), 12m central avenue,
 * 500kVA 11kV/415V Pad-Mounted Substation, underground XLPE cabling,
 * 6-way feeder pillars, LED streetlights, and landscaped park.
 */
export const GREENFIELD_ENCLAVE_PROJECT: ResidentialLayoutProject = {
  id: 'layout_greenfield_4ac',
  meta: {
    projectName: 'Ananya Serene Meadows Gated Layout',
    developerName: 'Sattva Green Developers LLP',
    location: 'Devenahalli, Bengaluru Rural, Karnataka',
    surveyNo: 'Sy. No. 142/2 & 143/1',
    workflow: 'new_layout',
    unit: 'meters',
    totalAreaSqM: 16800, // ~4.15 Acres
    totalAreaAcres: 4.15,
    plotCount: 28,
    targetLoadPerPlotKw: 6.0,
    diversityFactor: 0.75,
    totalEstimatedLoadKva: 175,
    transformerRatingKva: 500,
    date: new Date().toISOString().split('T')[0]
  },
  boundary: [
    [0, 0],
    [140, 0],
    [140, 120],
    [0, 120]
  ],
  roads: [
    {
      id: 'road_main_spine',
      name: 'Central Boulevard (12m ROW)',
      type: 'main_spine_12m',
      widthMeters: 12.0,
      curbWidthMeters: 0.35,
      footpathWidthMeters: 1.5,
      surfaceType: 'asphalt',
      startPoint: [0, 60],
      endPoint: [140, 60]
    },
    {
      id: 'road_cross_west',
      name: 'Bougainvillea Cross (9m ROW)',
      type: 'internal_9m',
      widthMeters: 9.0,
      curbWidthMeters: 0.3,
      footpathWidthMeters: 1.2,
      surfaceType: 'asphalt',
      startPoint: [45, 0],
      endPoint: [45, 120]
    },
    {
      id: 'road_cross_east',
      name: 'Jacaranda Cross (9m ROW)',
      type: 'internal_9m',
      widthMeters: 9.0,
      curbWidthMeters: 0.3,
      footpathWidthMeters: 1.2,
      surfaceType: 'asphalt',
      startPoint: [95, 0],
      endPoint: [95, 120]
    }
  ],
  plots: [
    // Sector 1: Top-Left (North-West)
    { id: 'p_01', plotNumber: 'P-01', x: 8, z: 8, width: 10, length: 14, facing: 'south', areaSqM: 140, hasBuilding: true, buildingType: 'villa_modern', status: 'constructed', sanctionedLoadKw: 6, servicePillarId: 'fp_1' },
    { id: 'p_02', plotNumber: 'P-02', x: 20, z: 8, width: 10, length: 14, facing: 'south', areaSqM: 140, hasBuilding: true, buildingType: 'contemporary_2fl', status: 'constructed', sanctionedLoadKw: 6, servicePillarId: 'fp_1' },
    { id: 'p_03', plotNumber: 'P-03', x: 32, z: 8, width: 10, length: 14, facing: 'south', areaSqM: 140, hasBuilding: false, buildingType: 'villa_modern', status: 'allocated', sanctionedLoadKw: 6, servicePillarId: 'fp_1' },
    { id: 'p_04', plotNumber: 'P-04', x: 8, z: 24, width: 10, length: 14, facing: 'south', areaSqM: 140, hasBuilding: true, buildingType: 'traditional_bungalow', status: 'constructed', sanctionedLoadKw: 6, servicePillarId: 'fp_1' },
    { id: 'p_05', plotNumber: 'P-05', x: 20, z: 24, width: 10, length: 14, facing: 'south', areaSqM: 140, hasBuilding: true, buildingType: 'villa_modern', status: 'constructed', sanctionedLoadKw: 6, servicePillarId: 'fp_1' },
    { id: 'p_06', plotNumber: 'P-06', x: 32, z: 24, width: 10, length: 14, facing: 'south', areaSqM: 140, hasBuilding: false, buildingType: 'contemporary_2fl', status: 'available', sanctionedLoadKw: 6, servicePillarId: 'fp_1' },

    // Sector 2: Top-Middle (North-Central)
    { id: 'p_07', plotNumber: 'P-07', x: 52, z: 8, width: 12, length: 16, facing: 'south', areaSqM: 192, hasBuilding: true, buildingType: 'contemporary_2fl', status: 'constructed', sanctionedLoadKw: 8, servicePillarId: 'fp_2' },
    { id: 'p_08', plotNumber: 'P-08', x: 66, z: 8, width: 12, length: 16, facing: 'south', areaSqM: 192, hasBuilding: true, buildingType: 'villa_modern', status: 'constructed', sanctionedLoadKw: 8, servicePillarId: 'fp_2' },
    { id: 'p_09', plotNumber: 'P-09', x: 80, z: 8, width: 12, length: 16, facing: 'south', areaSqM: 192, hasBuilding: false, buildingType: 'villa_modern', status: 'allocated', sanctionedLoadKw: 8, servicePillarId: 'fp_2' },
    { id: 'p_10', plotNumber: 'P-10', x: 52, z: 26, width: 12, length: 16, facing: 'south', areaSqM: 192, hasBuilding: true, buildingType: 'contemporary_2fl', status: 'constructed', sanctionedLoadKw: 8, servicePillarId: 'fp_2' },
    { id: 'p_11', plotNumber: 'P-11', x: 66, z: 26, width: 12, length: 16, facing: 'south', areaSqM: 192, hasBuilding: false, buildingType: 'traditional_bungalow', status: 'available', sanctionedLoadKw: 8, servicePillarId: 'fp_2' },
    { id: 'p_12', plotNumber: 'P-12', x: 80, z: 26, width: 12, length: 16, facing: 'south', areaSqM: 192, hasBuilding: true, buildingType: 'villa_modern', status: 'constructed', sanctionedLoadKw: 8, servicePillarId: 'fp_2' },

    // Sector 3: Top-Right (North-East Park Zone & Executive Plots)
    { id: 'p_13', plotNumber: 'P-13', x: 102, z: 8, width: 15, length: 18, facing: 'south', areaSqM: 270, hasBuilding: true, buildingType: 'contemporary_2fl', status: 'constructed', sanctionedLoadKw: 10, servicePillarId: 'fp_3' },
    { id: 'p_14', plotNumber: 'P-14', x: 120, z: 8, width: 15, length: 18, facing: 'south', areaSqM: 270, hasBuilding: true, buildingType: 'villa_modern', status: 'constructed', sanctionedLoadKw: 10, servicePillarId: 'fp_3' },
    { id: 'p_15', plotNumber: 'P-15', x: 102, z: 28, width: 15, length: 18, facing: 'south', areaSqM: 270, hasBuilding: false, buildingType: 'villa_modern', status: 'allocated', sanctionedLoadKw: 10, servicePillarId: 'fp_3' },
    { id: 'p_16', plotNumber: 'P-16', x: 120, z: 28, width: 15, length: 18, facing: 'south', areaSqM: 270, hasBuilding: true, buildingType: 'traditional_bungalow', status: 'constructed', sanctionedLoadKw: 10, servicePillarId: 'fp_3' },

    // Sector 4: Bottom-Left (South-West)
    { id: 'p_17', plotNumber: 'P-17', x: 8, z: 74, width: 10, length: 15, facing: 'north', areaSqM: 150, hasBuilding: true, buildingType: 'villa_modern', status: 'constructed', sanctionedLoadKw: 6, servicePillarId: 'fp_4' },
    { id: 'p_18', plotNumber: 'P-18', x: 20, z: 74, width: 10, length: 15, facing: 'north', areaSqM: 150, hasBuilding: true, buildingType: 'contemporary_2fl', status: 'constructed', sanctionedLoadKw: 6, servicePillarId: 'fp_4' },
    { id: 'p_19', plotNumber: 'P-19', x: 32, z: 74, width: 10, length: 15, facing: 'north', areaSqM: 150, hasBuilding: false, buildingType: 'villa_modern', status: 'available', sanctionedLoadKw: 6, servicePillarId: 'fp_4' },
    { id: 'p_20', plotNumber: 'P-20', x: 8, z: 92, width: 10, length: 15, facing: 'north', areaSqM: 150, hasBuilding: true, buildingType: 'traditional_bungalow', status: 'constructed', sanctionedLoadKw: 6, servicePillarId: 'fp_4' },
    { id: 'p_21', plotNumber: 'P-21', x: 20, z: 92, width: 10, length: 15, facing: 'north', areaSqM: 150, hasBuilding: false, buildingType: 'villa_modern', status: 'allocated', sanctionedLoadKw: 6, servicePillarId: 'fp_4' },
    { id: 'p_22', plotNumber: 'P-22', x: 32, z: 92, width: 10, length: 15, facing: 'north', areaSqM: 150, hasBuilding: true, buildingType: 'contemporary_2fl', status: 'constructed', sanctionedLoadKw: 6, servicePillarId: 'fp_4' },

    // Sector 5: Bottom-Middle (South-Central)
    { id: 'p_23', plotNumber: 'P-23', x: 52, z: 74, width: 12, length: 16, facing: 'north', areaSqM: 192, hasBuilding: true, buildingType: 'villa_modern', status: 'constructed', sanctionedLoadKw: 8, servicePillarId: 'fp_5' },
    { id: 'p_24', plotNumber: 'P-24', x: 66, z: 74, width: 12, length: 16, facing: 'north', areaSqM: 192, hasBuilding: true, buildingType: 'contemporary_2fl', status: 'constructed', sanctionedLoadKw: 8, servicePillarId: 'fp_5' },
    { id: 'p_25', plotNumber: 'P-25', x: 80, z: 74, width: 12, length: 16, facing: 'north', areaSqM: 192, hasBuilding: false, buildingType: 'villa_modern', status: 'available', sanctionedLoadKw: 8, servicePillarId: 'fp_5' },
    { id: 'p_26', plotNumber: 'P-26', x: 52, z: 94, width: 12, length: 16, facing: 'north', areaSqM: 192, hasBuilding: true, buildingType: 'traditional_bungalow', status: 'constructed', sanctionedLoadKw: 8, servicePillarId: 'fp_5' },
    { id: 'p_27', plotNumber: 'P-27', x: 66, z: 94, width: 12, length: 16, facing: 'north', areaSqM: 192, hasBuilding: false, buildingType: 'villa_modern', status: 'allocated', sanctionedLoadKw: 8, servicePillarId: 'fp_5' },
    { id: 'p_28', plotNumber: 'P-28', x: 80, z: 94, width: 12, length: 16, facing: 'north', areaSqM: 192, hasBuilding: true, buildingType: 'contemporary_2fl', status: 'constructed', sanctionedLoadKw: 8, servicePillarId: 'fp_5' }
  ],
  openSpaces: [
    {
      id: 'park_central',
      name: 'Serene Central Green Park & Gazebo',
      type: 'park_green',
      x: 100,
      z: 70,
      width: 36,
      length: 46,
      color: '#15803d'
    },
    {
      id: 'util_substation',
      name: '11kV Package Substation Utility Yard',
      type: 'utility_yard',
      x: 2,
      z: 48,
      width: 12,
      length: 10,
      color: '#334155'
    }
  ],
  infra: [
    // 11kV / 415V Package Substation
    {
      id: 'substation_dtr',
      name: '500kVA 11kV/415V Pad-Mounted Package Substation (DTR + RMU)',
      type: 'package_substation',
      x: 6,
      z: 53,
      capacity: '500 kVA 11kV / 415V Dyn11 ONAN',
      status: 'proposed_new',
      connectedPlotIds: []
    },
    // Chemical Earth Pit for Substation Neutral & Body
    {
      id: 'earth_pit_sub',
      name: 'Substation Dedicated Chemical Earth Electrode Grid (< 0.5 Ω)',
      type: 'earth_pit_grid',
      x: 3,
      z: 57,
      capacity: '2x 17.2mm Cu Bonded Rods',
      status: 'proposed_new',
      connectedPlotIds: []
    },
    // Feeder Pillars
    {
      id: 'fp_1',
      name: 'Feeder Pillar FP-01 (6-Way 400A)',
      type: 'feeder_pillar',
      x: 42,
      z: 48,
      capacity: '400A Busbar 6-Way HRC DIN-2',
      status: 'proposed_new',
      connectedPlotIds: ['p_01', 'p_02', 'p_03', 'p_04', 'p_05', 'p_06']
    },
    {
      id: 'fp_2',
      name: 'Feeder Pillar FP-02 (6-Way 400A)',
      type: 'feeder_pillar',
      x: 92,
      z: 48,
      capacity: '400A Busbar 6-Way HRC DIN-2',
      status: 'proposed_new',
      connectedPlotIds: ['p_07', 'p_08', 'p_09', 'p_10', 'p_11', 'p_12']
    },
    {
      id: 'fp_3',
      name: 'Feeder Pillar FP-03 (4-Way 250A Executive)',
      type: 'feeder_pillar',
      x: 136,
      z: 48,
      capacity: '250A Busbar 4-Way HRC',
      status: 'proposed_new',
      connectedPlotIds: ['p_13', 'p_14', 'p_15', 'p_16']
    },
    {
      id: 'fp_4',
      name: 'Feeder Pillar FP-04 (6-Way 400A)',
      type: 'feeder_pillar',
      x: 42,
      z: 70,
      capacity: '400A Busbar 6-Way HRC DIN-2',
      status: 'proposed_new',
      connectedPlotIds: ['p_17', 'p_18', 'p_19', 'p_20', 'p_21', 'p_22']
    },
    {
      id: 'fp_5',
      name: 'Feeder Pillar FP-05 (6-Way 400A)',
      type: 'feeder_pillar',
      x: 92,
      z: 70,
      capacity: '400A Busbar 6-Way HRC DIN-2',
      status: 'proposed_new',
      connectedPlotIds: ['p_23', 'p_24', 'p_25', 'p_26', 'p_27', 'p_28']
    },
    // Smart Octagonal Street Light Poles (Main Boulevard)
    { id: 'sl_01', name: '7m Octagonal Street Light Pole SL-01 (60W LED)', type: 'street_light_pole', x: 15, z: 54, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_02', name: '7m Octagonal Street Light Pole SL-02 (60W LED)', type: 'street_light_pole', x: 35, z: 54, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_03', name: '7m Octagonal Street Light Pole SL-03 (60W LED)', type: 'street_light_pole', x: 55, z: 54, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_04', name: '7m Octagonal Street Light Pole SL-04 (60W LED)', type: 'street_light_pole', x: 75, z: 54, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_05', name: '7m Octagonal Street Light Pole SL-05 (60W LED)', type: 'street_light_pole', x: 95, z: 54, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_06', name: '7m Octagonal Street Light Pole SL-06 (60W LED)', type: 'street_light_pole', x: 115, z: 54, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_07', name: '7m Octagonal Street Light Pole SL-07 (60W LED)', type: 'street_light_pole', x: 135, z: 54, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },

    // South Boulevard Street Light Poles
    { id: 'sl_08', name: '7m Octagonal Street Light Pole SL-08 (60W LED)', type: 'street_light_pole', x: 15, z: 66, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_09', name: '7m Octagonal Street Light Pole SL-09 (60W LED)', type: 'street_light_pole', x: 35, z: 66, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_10', name: '7m Octagonal Street Light Pole SL-10 (60W LED)', type: 'street_light_pole', x: 55, z: 66, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_11', name: '7m Octagonal Street Light Pole SL-11 (60W LED)', type: 'street_light_pole', x: 75, z: 66, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_12', name: '7m Octagonal Street Light Pole SL-12 (60W LED)', type: 'street_light_pole', x: 95, z: 66, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_13', name: '7m Octagonal Street Light Pole SL-13 (60W LED)', type: 'street_light_pole', x: 115, z: 66, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_14', name: '7m Octagonal Street Light Pole SL-14 (60W LED)', type: 'street_light_pole', x: 135, z: 66, capacity: '60W Warm White LED', status: 'proposed_new', connectedPlotIds: [] }
  ],
  cabling: [
    {
      id: 'cable_ht_in',
      name: '11kV Incoming HT Supply Feeder',
      cableClass: 'ht_11kv_underground',
      spec: '11kV (E) 3C x 300 sq.mm XLPE Insulated Aluminium Armoured (IS:7098 Pt-2)',
      waypoints: [[0, 53], [6, 53]],
      lengthMeters: 25,
      status: 'proposed_new'
    },
    {
      id: 'cable_lt_main_spine',
      name: 'Main LT Armoured Trunk Route (Substation to FP-01 to FP-03)',
      cableClass: 'lt_underground_armoured',
      spec: '1.1kV 3.5C x 240 sq.mm XLPE Aluminium Armoured Cable',
      waypoints: [[6, 53], [6, 54], [42, 54], [92, 54], [136, 54]],
      lengthMeters: 140,
      status: 'proposed_new'
    },
    {
      id: 'cable_lt_south_trunk',
      name: 'South LT Armoured Trunk Route (to FP-04 & FP-05)',
      cableClass: 'lt_underground_armoured',
      spec: '1.1kV 3.5C x 240 sq.mm XLPE Aluminium Armoured Cable',
      waypoints: [[6, 53], [6, 66], [42, 66], [92, 66]],
      lengthMeters: 100,
      status: 'proposed_new'
    },
    {
      id: 'cable_street_lighting',
      name: 'Street Lighting Control Cable Loop (Timer Operated)',
      cableClass: 'lt_underground_armoured',
      spec: '1.1kV 4C x 16 sq.mm Copper Armoured Cable (Astronomical Switch Controlled)',
      waypoints: [[6, 53], [15, 54], [35, 54], [55, 54], [75, 54], [95, 54], [115, 54], [135, 54]],
      lengthMeters: 155,
      status: 'proposed_new'
    }
  ]
};

/**
 * Workflow B: Heritage Enclave Upgrade (Overhead to Underground Conversion)
 * Demonstrates Existing vs Proposed diff comparison:
 * Existing: 18 concrete poles, bare ACSR Rabbit conductors, overloaded 100kVA transformer.
 * Proposed: 11kV 250kVA Pad-mounted DTR, underground armoured cables, 4 feeder pillars, 14 LED streetlights.
 */
export const HERITAGE_ENCLAVE_UPGRADE_PROJECT: ResidentialLayoutProject = {
  ...GREENFIELD_ENCLAVE_PROJECT,
  id: 'layout_heritage_upgrade',
  meta: {
    projectName: 'Heritage Enclave Overhead-to-Underground Modernization',
    developerName: 'Residents Welfare Association (RWA) & BESCOM',
    location: 'Malleshwaram Extension, Bengaluru',
    surveyNo: 'City Survey No. 841/B',
    workflow: 'existing_upgrade',
    unit: 'meters',
    totalAreaSqM: 12000,
    totalAreaAcres: 2.96,
    plotCount: 20,
    targetLoadPerPlotKw: 5.0,
    diversityFactor: 0.7,
    totalEstimatedLoadKva: 125,
    transformerRatingKva: 250,
    date: new Date().toISOString().split('T')[0]
  },
  infra: [
    // Existing Overhead Poles to be Removed
    { id: 'pole_old_1', name: 'Existing 8m Concrete Pole (Overhead ACSR Bare) [TO REMOVE]', type: 'existing_overhead_pole', x: 15, z: 54, capacity: 'ACSR Rabbit 50 sq.mm', status: 'existing_to_remove', connectedPlotIds: [] },
    { id: 'pole_old_2', name: 'Existing 8m Concrete Pole (Overhead ACSR Bare) [TO REMOVE]', type: 'existing_overhead_pole', x: 45, z: 54, capacity: 'ACSR Rabbit 50 sq.mm', status: 'existing_to_remove', connectedPlotIds: [] },
    { id: 'pole_old_3', name: 'Existing 8m Concrete Pole (Overhead ACSR Bare) [TO REMOVE]', type: 'existing_overhead_pole', x: 75, z: 54, capacity: 'ACSR Rabbit 50 sq.mm', status: 'existing_to_remove', connectedPlotIds: [] },
    { id: 'pole_old_4', name: 'Existing 8m Concrete Pole (Overhead ACSR Bare) [TO REMOVE]', type: 'existing_overhead_pole', x: 105, z: 54, capacity: 'ACSR Rabbit 50 sq.mm', status: 'existing_to_remove', connectedPlotIds: [] },
    { id: 'pole_old_5', name: 'Existing 8m Concrete Pole (Overhead ACSR Bare) [TO REMOVE]', type: 'existing_overhead_pole', x: 135, z: 54, capacity: 'ACSR Rabbit 50 sq.mm', status: 'existing_to_remove', connectedPlotIds: [] },

    // Proposed New 250kVA Pad Substation
    { id: 'sub_prop_250', name: 'PROPOSED: 250kVA 11kV/415V Pad-Mounted Compact Substation', type: 'package_substation', x: 6, z: 53, capacity: '250 kVA Oil Filled Dyn11', status: 'proposed_new', connectedPlotIds: [] },

    // Proposed Feeder Pillars
    { id: 'fp_prop_1', name: 'PROPOSED: Feeder Pillar FP-01 (4-Way 250A IP55)', type: 'feeder_pillar', x: 42, z: 54, capacity: '250A Busbar with HRC fuses', status: 'proposed_new', connectedPlotIds: ['p_01', 'p_02', 'p_03', 'p_04'] },
    { id: 'fp_prop_2', name: 'PROPOSED: Feeder Pillar FP-02 (4-Way 250A IP55)', type: 'feeder_pillar', x: 92, z: 54, capacity: '250A Busbar with HRC fuses', status: 'proposed_new', connectedPlotIds: ['p_07', 'p_08', 'p_09', 'p_10'] },

    // Proposed New LED Streetlight Poles
    { id: 'sl_prop_1', name: 'PROPOSED: 7m Octagonal Hot-Dip Galvanized Pole + 60W LED', type: 'street_light_pole', x: 25, z: 54, capacity: '60W Philips LED IP66', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_prop_2', name: 'PROPOSED: 7m Octagonal Hot-Dip Galvanized Pole + 60W LED', type: 'street_light_pole', x: 65, z: 54, capacity: '60W Philips LED IP66', status: 'proposed_new', connectedPlotIds: [] },
    { id: 'sl_prop_3', name: 'PROPOSED: 7m Octagonal Hot-Dip Galvanized Pole + 60W LED', type: 'street_light_pole', x: 105, z: 54, capacity: '60W Philips LED IP66', status: 'proposed_new', connectedPlotIds: [] }
  ],
  cabling: [
    {
      id: 'cbl_old_overhead',
      name: 'EXISTING: Bare Overhead ACSR Conductor (Dangerous & Prone to Outages) [TO DISMANTLE]',
      cableClass: 'existing_overhead_conductor',
      spec: 'ACSR Rabbit 50 sq.mm Bare Conductor (IS:398)',
      waypoints: [[15, 54], [45, 54], [75, 54], [105, 54], [135, 54]],
      lengthMeters: 120,
      status: 'removed'
    },
    {
      id: 'cbl_prop_underground',
      name: 'PROPOSED: 1.1kV 3.5C x 185 sq.mm Underground XLPE Armoured Cable in RCC Pipe',
      cableClass: 'lt_underground_armoured',
      spec: '1.1kV XLPE Aluminium Armoured (IS:7098 Pt-1)',
      waypoints: [[6, 53], [42, 54], [92, 54], [135, 54]],
      lengthMeters: 135,
      status: 'proposed_new'
    }
  ]
};
