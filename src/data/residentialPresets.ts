import { ResidentialProject } from '../types/residentialDesigner';

export const STANDARD_2BHK_PROJECT: ResidentialProject = {
  id: 'proj_2bhk_modern_v3_spacious',
  meta: {
    projectName: 'Greenwood Heights Grand 2BHK Twin (Spacious Walkthrough Layout)',
    customerName: 'Shri R. Narasimha Rao',
    location: 'Whitefield, Bengaluru, Karnataka',
    contactPhone: '+91 98450 12345',
    date: new Date().toISOString().split('T')[0],
    unit: 'meters',
    plotWidth: 30.0,
    plotLength: 26.0,
    setbackFront: 3.5,
    setbackRear: 2.5,
    setbackLeft: 2.5,
    setbackRight: 2.5,
    floorHeight: 3.8,
    exteriorWallThickness: 0.23,
    interiorWallThickness: 0.12,
    supplyPhase: '3-phase 415V',
    sanctionedLoadKw: 7.5,
    scope: {
      lightingAndFans: true,
      heavyAppliances: true,
      smartAutomation: true,
      surgeProtection: true,
      chemicalEarthing: true,
      solarRooftopReady: true
    }
  },
  rooms: [
    {
      id: 'room_living',
      name: 'Living & Dining Hall',
      type: 'living',
      x: 0,
      z: 0,
      width: 11.0,
      length: 8.4,
      ceilingHeight: 3.8,
      color: '#E0F2FE'
    },
    {
      id: 'room_kitchen',
      name: 'Modular Kitchen',
      type: 'kitchen',
      x: 11.0,
      z: 0,
      width: 6.4,
      length: 5.4,
      ceilingHeight: 3.8,
      color: '#FEF3C7'
    },
    {
      id: 'room_bath1',
      name: 'Common Bathroom',
      type: 'bathroom',
      x: 11.0,
      z: 5.4,
      width: 4.8,
      length: 3.0,
      ceilingHeight: 3.8,
      color: '#CCFBF1'
    },
    {
      id: 'room_master_bed',
      name: 'Master Bedroom',
      type: 'master_bedroom',
      x: 0,
      z: 8.4,
      width: 8.4,
      length: 7.6,
      ceilingHeight: 3.8,
      color: '#EDE9FE'
    },
    {
      id: 'room_bed2',
      name: 'Guest / Kids Bedroom',
      type: 'bedroom_2',
      x: 8.4,
      z: 8.4,
      width: 7.2,
      length: 7.6,
      ceilingHeight: 3.8,
      color: '#DCFCE7'
    },
    {
      id: 'room_foyer',
      name: 'Entrance Foyer & DB Zone',
      type: 'foyer',
      x: 0,
      z: -3.6,
      width: 5.0,
      length: 3.6,
      ceilingHeight: 3.8,
      color: '#F1F5F9'
    }
  ],
  openings: [
    {
      id: 'open_main_door',
      roomId: 'room_foyer',
      wallDirection: 'north',
      type: 'door',
      offset: 1.5,
      width: 2.0,
      height: 2.7,
      sillHeight: 0,
      swing: 'inside_left',
      label: 'Main Apartment Entrance Door'
    },
    {
      id: 'open_living_door',
      roomId: 'room_living',
      wallDirection: 'north',
      type: 'door',
      offset: 1.5,
      width: 2.0,
      height: 2.7,
      sillHeight: 0,
      swing: 'inside_right',
      label: 'Living & Dining Hall Door'
    },
    {
      id: 'open_master_door',
      roomId: 'room_master_bed',
      wallDirection: 'north',
      type: 'door',
      offset: 5.4,
      width: 1.8,
      height: 2.6,
      sillHeight: 0,
      swing: 'inside_left',
      label: 'Master Bedroom Door'
    },
    {
      id: 'open_bed2_door',
      roomId: 'room_bed2',
      wallDirection: 'north',
      type: 'door',
      offset: 0.4,
      width: 1.8,
      height: 2.6,
      sillHeight: 0,
      swing: 'inside_left',
      label: 'Guest / Kids Bedroom Door'
    },
    {
      id: 'open_kitchen_door',
      roomId: 'room_kitchen',
      wallDirection: 'west',
      type: 'door',
      offset: 1.8,
      width: 1.8,
      height: 2.6,
      sillHeight: 0,
      swing: 'inside_left',
      label: 'Modular Kitchen Door'
    },
    {
      id: 'open_bath_door',
      roomId: 'room_bath1',
      wallDirection: 'west',
      type: 'door',
      offset: 0.7,
      width: 1.6,
      height: 2.6,
      sillHeight: 0,
      swing: 'inside_right',
      label: 'Common Bathroom Door'
    },
    {
      id: 'open_living_win',
      roomId: 'room_living',
      wallDirection: 'west',
      type: 'window',
      offset: 2.4,
      width: 3.6,
      height: 1.8,
      sillHeight: 0.9
    },
    {
      id: 'open_master_win',
      roomId: 'room_master_bed',
      wallDirection: 'south',
      type: 'window',
      offset: 2.4,
      width: 3.2,
      height: 1.8,
      sillHeight: 0.9
    },
    {
      id: 'open_bed2_win',
      roomId: 'room_bed2',
      wallDirection: 'east',
      type: 'window',
      offset: 2.2,
      width: 2.8,
      height: 1.7,
      sillHeight: 0.95
    },
    {
      id: 'open_kitchen_win',
      roomId: 'room_kitchen',
      wallDirection: 'east',
      type: 'window',
      offset: 1.5,
      width: 2.4,
      height: 1.4,
      sillHeight: 1.1
    }
  ],
  electricalPoints: [
    // Main DB in Entrance Foyer
    {
      id: 'pt_main_db',
      type: 'db',
      roomId: 'room_foyer',
      name: '8-Way TPN Distribution Board + 63A Isolator & 30mA RCCB',
      x: 0.25,
      y: 1.65,
      z: -1.8,
      circuitId: 'c_earth_grid',
      powerWatts: 0,
      isOn: true,
      wallPlacement: 'west'
    },
    // Living Room Switchboard (near entrance)
    {
      id: 'pt_living_sb1',
      type: 'switch_board_6a',
      roomId: 'room_living',
      name: 'Living Room 8M Modular Switchboard + Fan Regulator',
      x: 0.2,
      y: 1.35,
      z: 0.9,
      circuitId: 'c1_living_lighting',
      powerWatts: 0,
      isOn: true,
      wallPlacement: 'west'
    },
    // Living Room LED Downlights (Ceiling)
    {
      id: 'pt_living_dl1',
      type: 'downlight_led',
      roomId: 'room_living',
      name: 'Living Downlight 1 (12W Warm White COB)',
      x: 3.2,
      y: 3.72,
      z: 2.4,
      circuitId: 'c1_living_lighting',
      powerWatts: 12,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_living_dl2',
      type: 'downlight_led',
      roomId: 'room_living',
      name: 'Living Downlight 2 (12W Warm White COB)',
      x: 8.0,
      y: 3.72,
      z: 2.4,
      circuitId: 'c1_living_lighting',
      powerWatts: 12,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_living_dl3',
      type: 'downlight_led',
      roomId: 'room_living',
      name: 'Living Downlight 3 (12W Cool Daylight)',
      x: 3.2,
      y: 3.72,
      z: 6.0,
      circuitId: 'c1_living_lighting',
      powerWatts: 12,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_living_dl4',
      type: 'downlight_led',
      roomId: 'room_living',
      name: 'Dining Chandelier / Downlight 4 (18W Warm)',
      x: 8.4,
      y: 3.72,
      z: 6.2,
      circuitId: 'c1_living_lighting',
      powerWatts: 18,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    // Living Room Ceiling Fan
    {
      id: 'pt_living_fan',
      type: 'ceiling_fan',
      roomId: 'room_living',
      name: 'Living 1200mm BLDC Smart Ceiling Fan',
      x: 5.0,
      y: 3.42,
      z: 4.0,
      circuitId: 'c1_living_lighting',
      powerWatts: 35,
      isOn: true,
      stateValue: 2,
      wallPlacement: 'ceiling'
    },
    // Living Entertainment Unit 16A Sockets
    {
      id: 'pt_living_socket1',
      type: 'power_socket_16a',
      roomId: 'room_living',
      name: 'TV Console 6A/16A Shuttered Twin Socket',
      x: 6.2,
      y: 0.65,
      z: 0.18,
      circuitId: 'c3_power_sockets',
      powerWatts: 220,
      isOn: true,
      wallPlacement: 'north'
    },
    // Master Bedroom Switchboard
    {
      id: 'pt_master_sb',
      type: 'switch_board_6a',
      roomId: 'room_master_bed',
      name: 'Master Bed 2-Way 6M Modular Switchboard',
      x: 4.8,
      y: 1.35,
      z: 8.58,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 0,
      isOn: true,
      wallPlacement: 'north'
    },
    // Master Bed Ceiling Fan
    {
      id: 'pt_master_fan',
      type: 'ceiling_fan',
      roomId: 'room_master_bed',
      name: 'Master Bed 1200mm Silent BLDC Fan',
      x: 4.2,
      y: 3.42,
      z: 12.2,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 32,
      isOn: true,
      stateValue: 2,
      wallPlacement: 'ceiling'
    },
    // Master Bed Downlights
    {
      id: 'pt_master_dl1',
      type: 'downlight_led',
      roomId: 'room_master_bed',
      name: 'Master Bed Downlight 1 (9W Warm)',
      x: 2.4,
      y: 3.72,
      z: 10.4,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 9,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_master_dl2',
      type: 'downlight_led',
      roomId: 'room_master_bed',
      name: 'Master Bed Downlight 2 (9W Warm)',
      x: 6.0,
      y: 3.72,
      z: 13.8,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 9,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    // Master Bedside Socket
    {
      id: 'pt_master_socket',
      type: 'combined_socket_6_16a',
      roomId: 'room_master_bed',
      name: 'Master Bedside & Desk 6/16A USB Socket',
      x: 0.2,
      y: 0.75,
      z: 10.4,
      circuitId: 'c3_power_sockets',
      powerWatts: 120,
      isOn: true,
      wallPlacement: 'west'
    },
    // Master Bedroom Inverter AC Isolator
    {
      id: 'pt_master_ac',
      type: 'ac_isolator',
      roomId: 'room_master_bed',
      name: 'Master 1.5 Ton Split Inverter AC (20A DP Isolator)',
      x: 4.2,
      y: 2.85,
      z: 15.82,
      circuitId: 'c5_heavy_ac',
      powerWatts: 1450,
      isOn: true,
      wallPlacement: 'south'
    },
    // Guest / Kids Bedroom Switchboard, Fan, Light, Socket & AC
    {
      id: 'pt_bed2_sb',
      type: 'switch_board_6a',
      roomId: 'room_bed2',
      name: 'Guest Bedroom Entry 6M Switchboard',
      x: 11.2,
      y: 1.35,
      z: 8.58,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 0,
      isOn: true,
      wallPlacement: 'north'
    },
    {
      id: 'pt_bed2_fan',
      type: 'ceiling_fan',
      roomId: 'room_bed2',
      name: 'Guest Bedroom 1200mm BLDC Fan',
      x: 12.0,
      y: 3.42,
      z: 12.2,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 30,
      isOn: true,
      stateValue: 2,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_bed2_dl1',
      type: 'downlight_led',
      roomId: 'room_bed2',
      name: 'Guest Bedroom LED Panel Light (12W)',
      x: 12.0,
      y: 3.72,
      z: 10.4,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 12,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_bed2_socket',
      type: 'combined_socket_6_16a',
      roomId: 'room_bed2',
      name: 'Guest Study Desk 6/16A Power Outlet',
      x: 15.42,
      y: 0.85,
      z: 13.6,
      circuitId: 'c3_power_sockets',
      powerWatts: 150,
      isOn: true,
      wallPlacement: 'east'
    },
    {
      id: 'pt_bed2_ac',
      type: 'ac_isolator',
      roomId: 'room_bed2',
      name: 'Guest 1.0 Ton Split AC (20A Isolator)',
      x: 12.0,
      y: 2.85,
      z: 15.82,
      circuitId: 'c5_heavy_ac',
      powerWatts: 1050,
      isOn: false,
      wallPlacement: 'south'
    },
    // Kitchen Switchboard, Lighting & Heavy Power Sockets (Refrigerator, Microwave, Chimney, Induction)
    {
      id: 'pt_kitchen_sb',
      type: 'switch_board_6a',
      roomId: 'room_kitchen',
      name: 'Kitchen Entry 6M Modular Switchboard',
      x: 11.18,
      y: 1.35,
      z: 1.1,
      circuitId: 'c1_living_lighting',
      powerWatts: 0,
      isOn: true,
      wallPlacement: 'west'
    },
    {
      id: 'pt_kitchen_dl1',
      type: 'downlight_led',
      roomId: 'room_kitchen',
      name: 'Kitchen 15W Cool Daylight LED Downlight + Exhaust',
      x: 14.2,
      y: 3.72,
      z: 2.7,
      circuitId: 'c1_living_lighting',
      powerWatts: 40,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_kitchen_socket1',
      type: 'power_socket_16a',
      roomId: 'room_kitchen',
      name: 'Kitchen Counter 16A Induction Hob & Chimney Point',
      x: 17.22,
      y: 1.25,
      z: 2.4,
      circuitId: 'c4_kitchen_power',
      powerWatts: 2100,
      isOn: true,
      wallPlacement: 'east'
    },
    {
      id: 'pt_kitchen_socket2',
      type: 'power_socket_16a',
      roomId: 'room_kitchen',
      name: 'Refrigerator & Microwave Dedicated 16A Point',
      x: 14.4,
      y: 1.25,
      z: 0.18,
      circuitId: 'c4_kitchen_power',
      powerWatts: 850,
      isOn: true,
      wallPlacement: 'north'
    },
    // Common Bathroom Switchboard, Lighting, Exhaust & 25L Storage Geyser
    {
      id: 'pt_bath_sb',
      type: 'switch_board_6a',
      roomId: 'room_bath1',
      name: 'Bathroom Entry Switchboard (Light, Exhaust & Geyser DP)',
      x: 11.18,
      y: 1.35,
      z: 5.8,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 0,
      isOn: true,
      wallPlacement: 'west'
    },
    {
      id: 'pt_bath_dl1',
      type: 'downlight_led',
      roomId: 'room_bath1',
      name: 'Bathroom IP65 Moisture-Proof LED + Exhaust Fan',
      x: 13.4,
      y: 3.72,
      z: 6.9,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 28,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_bath_geyser',
      type: 'geyser_point',
      roomId: 'room_bath1',
      name: 'Bathroom 25L Storage Water Heater (20A DP Switch)',
      x: 15.62,
      y: 2.45,
      z: 6.9,
      circuitId: 'c6_bathroom_geyser',
      powerWatts: 2000,
      isOn: true,
      wallPlacement: 'east'
    },
    // External Chemical Earth Pit
    {
      id: 'pt_earth_pit',
      type: 'earth_pit',
      roomId: 'room_foyer',
      name: 'IS:3043 Chemical Copper-Bonded Earth Electrode Pit',
      x: -2.2,
      y: 0.05,
      z: -2.4,
      circuitId: 'c_earth_grid',
      powerWatts: 0,
      isOn: true,
      wallPlacement: 'ground'
    }
  ],
  circuits: [
    {
      id: 'c1_living_lighting',
      code: 'C1',
      name: 'Living, Dining & Kitchen Lighting Circuit',
      wireType: '2 × 1.5 sq.mm + 1 × 1.5 sq.mm PE FRLS Copper (IS:694)',
      phaseColor: '#3B82F6',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '10A SP Type-B MCB (10kA)',
      conduitSize: '20mm',
      connectedPointIds: [
        'pt_living_sb1',
        'pt_living_dl1',
        'pt_living_dl2',
        'pt_living_dl3',
        'pt_living_dl4',
        'pt_living_fan',
        'pt_kitchen_sb',
        'pt_kitchen_dl1'
      ],
      maxCapacityWatts: 1800,
      description: 'Lighting & fan sub-circuit in 20mm concealed rigid PVC conduit feeding Living, Dining, and Kitchen luminaires.'
    },
    {
      id: 'c2_bedroom_fan',
      code: 'C2',
      name: 'Bedrooms & Bathroom Lighting + Fan Circuit',
      wireType: '2 × 1.5 sq.mm + 1 × 1.5 sq.mm PE FRLS Copper',
      phaseColor: '#0EA5E9',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '10A SP Type-B MCB (10kA)',
      conduitSize: '20mm',
      connectedPointIds: [
        'pt_master_sb',
        'pt_master_fan',
        'pt_master_dl1',
        'pt_master_dl2',
        'pt_bed2_sb',
        'pt_bed2_fan',
        'pt_bed2_dl1',
        'pt_bath_sb',
        'pt_bath_dl1'
      ],
      maxCapacityWatts: 1800,
      description: 'Concealed ceiling and wall PVC conduit circuit supplying Master Bedroom, Guest Bedroom, and IP65 Bathroom lighting/exhaust.'
    },
    {
      id: 'c3_power_sockets',
      code: 'C3',
      name: 'General 6A/16A Utility & Desk Sockets',
      wireType: '2 × 2.5 sq.mm + 1 × 1.5 sq.mm PE FRLS Copper',
      phaseColor: '#F59E0B',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '16A SP Type-C MCB (10kA)',
      conduitSize: '25mm',
      connectedPointIds: ['pt_living_socket1', 'pt_master_socket', 'pt_bed2_socket'],
      maxCapacityWatts: 3680,
      description: 'Shuttered 3-pin socket outlets for TV entertainment unit, bedside chargers, and study desks.'
    },
    {
      id: 'c4_kitchen_power',
      code: 'C4',
      name: 'Kitchen Heavy Appliances (Hob, Chimney, Fridge)',
      wireType: '2 × 4.0 sq.mm + 1 × 2.5 sq.mm PE FRLS Copper',
      phaseColor: '#EF4444',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '20A SP Type-C MCB (10kA)',
      conduitSize: '25mm',
      connectedPointIds: ['pt_kitchen_socket1', 'pt_kitchen_socket2'],
      maxCapacityWatts: 4600,
      description: 'Dedicated high-load kitchen circuit for simultaneous induction cooktop, auto-clean chimney, microwave, and refrigerator.'
    },
    {
      id: 'c5_heavy_ac',
      code: 'C5',
      name: 'Split Air-Conditioning Circuit (Master & Guest)',
      wireType: '2 × 4.0 sq.mm + 1 × 2.5 sq.mm PE FRLS Copper',
      phaseColor: '#A855F7',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '25A SP Type-C MCB (10kA)',
      conduitSize: '25mm',
      connectedPointIds: ['pt_master_ac', 'pt_bed2_ac'],
      maxCapacityWatts: 5200,
      description: 'Direct homerun circuit from TPN DB to 20A rotary AC isolators with surge isolation.'
    },
    {
      id: 'c6_bathroom_geyser',
      code: 'C6',
      name: 'Bathroom 25L Storage Water Heater (Geyser)',
      wireType: '2 × 4.0 sq.mm + 1 × 2.5 sq.mm PE FRLS Copper',
      phaseColor: '#EC4899',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '20A 30mA RCBO (Type-A)',
      conduitSize: '25mm',
      connectedPointIds: ['pt_bath_geyser'],
      maxCapacityWatts: 4000,
      description: 'Dedicated wet-zone heating circuit protected by a 30mA RCBO and double-pole indicator switch.'
    },
    {
      id: 'c_earth_grid',
      code: 'PE',
      name: 'Protective Earth & Chemical Grounding Grid',
      wireType: '8 SWG Copper Conductor / 4.0 sq.mm Green-Yellow PE',
      phaseColor: '#10B981',
      neutralColor: '#10B981',
      earthColor: '#10B981',
      mcbRating: '63A 4P Isolator + 40A 30mA RCCB',
      conduitSize: '25mm',
      connectedPointIds: ['pt_main_db', 'pt_earth_pit'],
      maxCapacityWatts: 12000,
      description: 'Continuous protective earth loop bonded to Main DB earth busbar and IS:3043 outdoor chemical earth pit (< 0.85 Ω).'
    }
  ]
};

export const COMPACT_2BHK_PROJECT: ResidentialProject = {
  ...STANDARD_2BHK_PROJECT,
  id: 'proj_2bhk_compact_spacious',
  meta: {
    ...STANDARD_2BHK_PROJECT.meta,
    projectName: 'Urban Nest 2BHK Spacious (1,650 sq.ft)',
    customerName: 'Smt. Priya Sundaram',
    location: 'Electronic City, Bengaluru',
    plotWidth: 26.0,
    plotLength: 22.0,
    floorHeight: 3.6,
    sanctionedLoadKw: 6.0
  },
  rooms: [
    {
      id: 'room_living',
      name: 'Living & Dining Area',
      type: 'living',
      x: 0,
      z: 0,
      width: 9.6,
      length: 7.4,
      ceilingHeight: 3.6,
      color: '#E0F2FE'
    },
    {
      id: 'room_kitchen',
      name: 'Kitchen',
      type: 'kitchen',
      x: 9.6,
      z: 0,
      width: 5.6,
      length: 4.8,
      ceilingHeight: 3.6,
      color: '#FEF3C7'
    },
    {
      id: 'room_bath1',
      name: 'Common Bathroom',
      type: 'bathroom',
      x: 9.6,
      z: 4.8,
      width: 4.4,
      length: 2.6,
      ceilingHeight: 3.6,
      color: '#CCFBF1'
    },
    {
      id: 'room_master_bed',
      name: 'Master Bedroom',
      type: 'master_bedroom',
      x: 0,
      z: 7.4,
      width: 7.6,
      length: 6.8,
      ceilingHeight: 3.6,
      color: '#EDE9FE'
    },
    {
      id: 'room_bed2',
      name: 'Bedroom 2',
      type: 'bedroom_2',
      x: 7.6,
      z: 7.4,
      width: 6.6,
      length: 6.8,
      ceilingHeight: 3.6,
      color: '#DCFCE7'
    },
    {
      id: 'room_foyer',
      name: 'Entrance Foyer & DB Zone',
      type: 'foyer',
      x: 0,
      z: -3.2,
      width: 4.6,
      length: 3.2,
      ceilingHeight: 3.6,
      color: '#F1F5F9'
    }
  ]
};

export const LUXURY_3BHK_PROJECT: ResidentialProject = {
  ...STANDARD_2BHK_PROJECT,
  id: 'proj_3bhk_luxury_spacious',
  meta: {
    ...STANDARD_2BHK_PROJECT.meta,
    projectName: 'Prestige Villa Grand 3BHK Smart Home (3,400 sq.ft)',
    customerName: 'Dr. Vikram Malhotra',
    location: 'Sadashivanagar, Bengaluru',
    plotWidth: 36.0,
    plotLength: 30.0,
    floorHeight: 4.0,
    sanctionedLoadKw: 12.0,
    supplyPhase: '3-phase 415V'
  },
  rooms: [
    {
      id: 'room_living',
      name: 'Formal Living & Dining Hall',
      type: 'living',
      x: 0,
      z: 0,
      width: 12.6,
      length: 9.6,
      ceilingHeight: 4.0,
      color: '#E0F2FE'
    },
    {
      id: 'room_kitchen',
      name: 'Island Kitchen & Utility',
      type: 'kitchen',
      x: 12.6,
      z: 0,
      width: 7.4,
      length: 6.2,
      ceilingHeight: 4.0,
      color: '#FEF3C7'
    },
    {
      id: 'room_bath1',
      name: 'Luxury Bath Suite',
      type: 'bathroom',
      x: 12.6,
      z: 6.2,
      width: 5.6,
      length: 3.4,
      ceilingHeight: 4.0,
      color: '#CCFBF1'
    },
    {
      id: 'room_master_bed',
      name: 'Grand Master Suite',
      type: 'master_bedroom',
      x: 0,
      z: 9.6,
      width: 9.6,
      length: 8.6,
      ceilingHeight: 4.0,
      color: '#EDE9FE'
    },
    {
      id: 'room_bed2',
      name: 'Guest Suite',
      type: 'bedroom_2',
      x: 9.6,
      z: 9.6,
      width: 8.4,
      length: 8.6,
      ceilingHeight: 4.0,
      color: '#DCFCE7'
    },
    {
      id: 'room_foyer',
      name: 'Grand Entrance Foyer & DB Zone',
      type: 'foyer',
      x: 0,
      z: -4.0,
      width: 5.6,
      length: 4.0,
      ceilingHeight: 4.0,
      color: '#F1F5F9'
    }
  ]
};

export const RESIDENTIAL_TEMPLATES = [
  {
    id: '2bhk',
    badge: '2BHK GRAND',
    name: 'Greenwood Heights Grand 2BHK',
    project: STANDARD_2BHK_PROJECT
  },
  {
    id: '2bhk_compact',
    badge: '2BHK SPACIOUS',
    name: 'Urban Nest 2BHK',
    project: COMPACT_2BHK_PROJECT
  },
  {
    id: '3bhk_luxury',
    badge: '3BHK VILLA',
    name: 'Prestige Villa Grand 3BHK',
    project: LUXURY_3BHK_PROJECT
  }
];

