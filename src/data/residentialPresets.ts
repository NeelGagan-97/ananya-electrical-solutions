import { ResidentialProject } from '../types/residentialDesigner';

export const STANDARD_2BHK_PROJECT: ResidentialProject = {
  id: 'proj_2bhk_modern',
  meta: {
    projectName: 'Greenwood Heights 2BHK Twin',
    customerName: 'Shri R. Narasimha Rao',
    location: 'Whitefield, Bengaluru, Karnataka',
    contactPhone: '+91 98450 12345',
    date: new Date().toISOString().split('T')[0],
    unit: 'meters',
    plotWidth: 15.0, // 50 ft
    plotLength: 12.0, // 40 ft
    setbackFront: 2.0,
    setbackRear: 1.5,
    setbackLeft: 1.2,
    setbackRight: 1.2,
    floorHeight: 3.0,
    exteriorWallThickness: 0.23,
    interiorWallThickness: 0.115,
    supplyPhase: '1-phase 230V',
    sanctionedLoadKw: 6.0,
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
      width: 5.5,
      length: 4.2,
      ceilingHeight: 3.0,
      color: '#E0F2FE'
    },
    {
      id: 'room_kitchen',
      name: 'Modular Kitchen',
      type: 'kitchen',
      x: 5.5,
      z: 0,
      width: 3.2,
      length: 3.0,
      ceilingHeight: 3.0,
      color: '#FEF3C7'
    },
    {
      id: 'room_bath1',
      name: 'Common Bathroom',
      type: 'bathroom',
      x: 5.5,
      z: 3.0,
      width: 2.2,
      length: 2.4,
      ceilingHeight: 3.0,
      color: '#CCFBF1'
    },
    {
      id: 'room_master_bed',
      name: 'Master Bedroom',
      type: 'master_bedroom',
      x: 0,
      z: 4.2,
      width: 4.2,
      length: 3.8,
      ceilingHeight: 3.0,
      color: '#EDE9FE'
    },
    {
      id: 'room_bed2',
      name: 'Kids / Guest Bedroom',
      type: 'bedroom_2',
      x: 4.2,
      z: 5.4,
      width: 3.5,
      length: 3.4,
      ceilingHeight: 3.0,
      color: '#DCFCE7'
    },
    {
      id: 'room_foyer',
      name: 'Entrance Foyer & DB Zone',
      type: 'foyer',
      x: 0,
      z: -1.8,
      width: 2.4,
      length: 1.8,
      ceilingHeight: 3.0,
      color: '#F1F5F9'
    }
  ],
  openings: [
    {
      id: 'open_main_door',
      roomId: 'room_foyer',
      wallDirection: 'south',
      type: 'door',
      offset: 0.6,
      width: 1.1,
      height: 2.2,
      sillHeight: 0,
      swing: 'inside_left'
    },
    {
      id: 'open_living_door',
      roomId: 'room_living',
      wallDirection: 'north',
      type: 'door',
      offset: 1.0,
      width: 1.0,
      height: 2.1,
      sillHeight: 0,
      swing: 'inside_right'
    },
    {
      id: 'open_master_door',
      roomId: 'room_master_bed',
      wallDirection: 'north',
      type: 'door',
      offset: 0.4,
      width: 0.9,
      height: 2.1,
      sillHeight: 0,
      swing: 'inside_left'
    },
    {
      id: 'open_bed2_door',
      roomId: 'room_bed2',
      wallDirection: 'north',
      type: 'door',
      offset: 0.4,
      width: 0.9,
      height: 2.1,
      sillHeight: 0,
      swing: 'inside_left'
    },
    {
      id: 'open_kitchen_door',
      roomId: 'room_kitchen',
      wallDirection: 'west',
      type: 'door',
      offset: 0.8,
      width: 0.9,
      height: 2.1,
      sillHeight: 0,
      swing: 'inside_left'
    },
    {
      id: 'open_living_win',
      roomId: 'room_living',
      wallDirection: 'west',
      type: 'window',
      offset: 1.2,
      width: 1.8,
      height: 1.4,
      sillHeight: 0.8
    },
    {
      id: 'open_master_win',
      roomId: 'room_master_bed',
      wallDirection: 'south',
      type: 'window',
      offset: 1.2,
      width: 1.5,
      height: 1.4,
      sillHeight: 0.8
    },
    {
      id: 'open_kitchen_win',
      roomId: 'room_kitchen',
      wallDirection: 'east',
      type: 'window',
      offset: 0.8,
      width: 1.2,
      height: 1.1,
      sillHeight: 1.0
    }
  ],
  electricalPoints: [
    // Main DB in Entrance Foyer
    {
      id: 'pt_main_db',
      type: 'db',
      roomId: 'room_foyer',
      name: 'Main Distribution Board (8-Way SPN)',
      x: 0.3,
      y: 1.5,
      z: -1.6,
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
      name: 'Living Room 6M Modular Switchboard',
      x: 0.3,
      y: 1.2,
      z: 0.4,
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
      name: 'Living Downlight 1 (12W Warm White)',
      x: 1.8,
      y: 2.95,
      z: 1.4,
      circuitId: 'c1_living_lighting',
      powerWatts: 12,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_living_dl2',
      type: 'downlight_led',
      roomId: 'room_living',
      name: 'Living Downlight 2 (12W Warm White)',
      x: 3.8,
      y: 2.95,
      z: 1.4,
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
      x: 1.8,
      y: 2.95,
      z: 2.8,
      circuitId: 'c1_living_lighting',
      powerWatts: 12,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_living_dl4',
      type: 'downlight_led',
      roomId: 'room_living',
      name: 'Living Downlight 4 (12W Cool Daylight)',
      x: 3.8,
      y: 2.95,
      z: 2.8,
      circuitId: 'c1_living_lighting',
      powerWatts: 12,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    // Living Room Ceiling Fan
    {
      id: 'pt_living_fan',
      type: 'ceiling_fan',
      roomId: 'room_living',
      name: 'Living 1200mm BLDC Smart Fan',
      x: 2.75,
      y: 2.7,
      z: 2.1,
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
      name: 'TV Entertainment 16A Shuttered Socket',
      x: 0.3,
      y: 0.45,
      z: 2.8,
      circuitId: 'c3_power_sockets',
      powerWatts: 250,
      isOn: true,
      wallPlacement: 'west'
    },
    // Master Bedroom Switchboard
    {
      id: 'pt_master_sb',
      type: 'switch_board_6a',
      roomId: 'room_master_bed',
      name: 'Master Bed Entry 6M Switchboard',
      x: 0.3,
      y: 1.2,
      z: 4.6,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 0,
      isOn: true,
      wallPlacement: 'west'
    },
    // Master Bed Ceiling Fan
    {
      id: 'pt_master_fan',
      type: 'ceiling_fan',
      roomId: 'room_master_bed',
      name: 'Master Bed 1200mm Silent BLDC Fan',
      x: 2.1,
      y: 2.7,
      z: 6.1,
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
      name: 'Master Bed Downlight (9W Warm)',
      x: 1.4,
      y: 2.95,
      z: 5.2,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 9,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_master_dl2',
      type: 'downlight_led',
      roomId: 'room_master_bed',
      name: 'Master Bed Downlight (9W Warm)',
      x: 2.8,
      y: 2.95,
      z: 6.8,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 9,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    // Master Bedroom Inverter AC Isolator
    {
      id: 'pt_master_ac',
      type: 'ac_isolator',
      roomId: 'room_master_bed',
      name: 'Master 1.5 Ton AC 20A Isolator',
      x: 3.9,
      y: 2.4,
      z: 7.6,
      circuitId: 'c5_heavy_ac',
      powerWatts: 1500,
      isOn: true,
      wallPlacement: 'south'
    },
    // Bedroom 2 Fan & Light
    {
      id: 'pt_bed2_fan',
      type: 'ceiling_fan',
      roomId: 'room_bed2',
      name: 'Kids Bed BLDC Fan',
      x: 5.9,
      y: 2.7,
      z: 7.1,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 30,
      isOn: true,
      stateValue: 1,
      wallPlacement: 'ceiling'
    },
    // Kitchen Heavy Power Socket (Induction & Microwave)
    {
      id: 'pt_kitchen_socket1',
      type: 'power_socket_16a',
      roomId: 'room_kitchen',
      name: 'Countertop 16A Induction Hob Point',
      x: 8.4,
      y: 1.1,
      z: 1.2,
      circuitId: 'c4_kitchen_power',
      powerWatts: 2100,
      isOn: true,
      wallPlacement: 'east'
    },
    {
      id: 'pt_kitchen_socket2',
      type: 'power_socket_16a',
      roomId: 'room_kitchen',
      name: 'Microwave / Refrigerator 16A Point',
      x: 8.4,
      y: 1.1,
      z: 2.4,
      circuitId: 'c4_kitchen_power',
      powerWatts: 1200,
      isOn: true,
      wallPlacement: 'east'
    },
    // External Chemical Earth Pit
    {
      id: 'pt_earth_pit',
      type: 'earth_pit',
      roomId: 'room_foyer',
      name: 'IS:3043 Chemical Earth Electrode Pit',
      x: -1.5,
      y: 0.05,
      z: -1.6,
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
      name: 'Living & Dining Lighting Circuit',
      wireType: '1.5 sq.mm FRLS Copper (IS:694)',
      phaseColor: '#EF4444',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '6A SP Type-C MCB (10kA)',
      conduitSize: '20mm',
      connectedPointIds: ['pt_living_sb1', 'pt_living_dl1', 'pt_living_dl2', 'pt_living_dl3', 'pt_living_dl4', 'pt_living_fan'],
      maxCapacityWatts: 1380,
      description: 'Radial lighting branch supplying false-ceiling recessed LED fixtures and BLDC fan in living zone.'
    },
    {
      id: 'c2_bedroom_fan',
      code: 'C2',
      name: 'Bedrooms Lighting & Fan Circuit',
      wireType: '1.5 sq.mm FRLS Copper',
      phaseColor: '#EF4444',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '6A SP Type-C MCB',
      conduitSize: '20mm',
      connectedPointIds: ['pt_master_sb', 'pt_master_fan', 'pt_master_dl1', 'pt_master_dl2', 'pt_bed2_fan'],
      maxCapacityWatts: 1380,
      description: 'Concealed ceiling and wall conduit circuit supplying master and kids bedroom lighting and BLDC fans.'
    },
    {
      id: 'c3_power_sockets',
      code: 'C3',
      name: 'Convenience Socket Outlets (16A / 6A)',
      wireType: '2.5 sq.mm FRLS Copper',
      phaseColor: '#EF4444',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '16A SP Type-C MCB',
      conduitSize: '25mm',
      connectedPointIds: ['pt_living_socket1'],
      maxCapacityWatts: 3680,
      description: 'Ring and radial shuttered socket outlets for entertainment console, work desk, and portable loads.'
    },
    {
      id: 'c4_kitchen_power',
      code: 'C4',
      name: 'Kitchen Heavy Appliance Power',
      wireType: '4.0 sq.mm Heavy-Duty Flame Retardant Copper',
      phaseColor: '#EF4444',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '20A SP Type-C MCB',
      conduitSize: '25mm',
      connectedPointIds: ['pt_kitchen_socket1', 'pt_kitchen_socket2'],
      maxCapacityWatts: 4600,
      description: 'Dedicated high-amperage run sized for simultaneous induction hob, microwave, and dishwasher operation.'
    },
    {
      id: 'c5_heavy_ac',
      code: 'C5',
      name: 'Master Bedroom 1.5 Ton Inverter AC',
      wireType: '4.0 sq.mm High Current Copper',
      phaseColor: '#EF4444',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '20A SP Type-C MCB',
      conduitSize: '25mm',
      connectedPointIds: ['pt_master_ac'],
      maxCapacityWatts: 4600,
      description: 'Direct homerun circuit from DB to bedroom AC isolator to isolate compressor startup surges.'
    },
    {
      id: 'c_earth_grid',
      code: 'PE',
      name: 'Protective Earth & Grounding Grid',
      wireType: '8 SWG Pure Copper Strip / 4.0 sq.mm Cable',
      phaseColor: '#10B981',
      neutralColor: '#10B981',
      earthColor: '#10B981',
      mcbRating: '40A 30mA 2P RCCB',
      conduitSize: '25mm',
      connectedPointIds: ['pt_main_db', 'pt_earth_pit'],
      maxCapacityWatts: 9200,
      description: 'Continuous protective earthing grid with 30mA residual current life-safety interrupter and chemical earth pit.'
    }
  ]
};

export const COMPACT_2BHK_PROJECT: ResidentialProject = {
  ...STANDARD_2BHK_PROJECT,
  id: 'proj_2bhk_compact',
  meta: {
    ...STANDARD_2BHK_PROJECT.meta,
    projectName: 'Urban Nest 2BHK Compact (850 sq.ft)',
    customerName: 'Smt. Priya Sundaram',
    location: 'Electronic City, Bengaluru',
    plotWidth: 12.0,
    plotLength: 10.0,
    sanctionedLoadKw: 5.0
  },
  rooms: [
    {
      id: 'room_living',
      name: 'Living & Dining Area',
      type: 'living',
      x: 0,
      z: 0,
      width: 4.5,
      length: 3.5,
      ceilingHeight: 2.8,
      color: '#E0F2FE'
    },
    {
      id: 'room_kitchen',
      name: 'Kitchen',
      type: 'kitchen',
      x: 4.5,
      z: 0,
      width: 2.8,
      length: 2.5,
      ceilingHeight: 2.8,
      color: '#FEF3C7'
    },
    {
      id: 'room_master_bed',
      name: 'Master Bedroom',
      type: 'master_bedroom',
      x: 0,
      z: 3.5,
      width: 3.8,
      length: 3.2,
      ceilingHeight: 2.8,
      color: '#EDE9FE'
    },
    {
      id: 'room_bed2',
      name: 'Bedroom 2',
      type: 'bedroom_2',
      x: 3.8,
      z: 3.5,
      width: 3.5,
      length: 3.2,
      ceilingHeight: 2.8,
      color: '#DCFCE7'
    }
  ]
};

export const LUXURY_3BHK_PROJECT: ResidentialProject = {
  ...STANDARD_2BHK_PROJECT,
  id: 'proj_3bhk_luxury',
  meta: {
    ...STANDARD_2BHK_PROJECT.meta,
    projectName: 'Prestige Villa 3BHK Smart Home (1850 sq.ft)',
    customerName: 'Dr. Vikram Malhotra',
    location: 'Sadashivanagar, Bengaluru',
    plotWidth: 18.0,
    plotLength: 15.0,
    sanctionedLoadKw: 10.0,
    supplyPhase: '3-phase 415V'
  },
  rooms: [
    {
      id: 'room_living',
      name: 'Formal Living Room',
      type: 'living',
      x: 0,
      z: 0,
      width: 6.2,
      length: 5.0,
      ceilingHeight: 3.2,
      color: '#E0F2FE'
    },
    {
      id: 'room_dining',
      name: 'Dining & Pooja Room',
      type: 'custom',
      x: 6.2,
      z: 0,
      width: 4.0,
      length: 4.0,
      ceilingHeight: 3.2,
      color: '#FEF3C7'
    },
    {
      id: 'room_kitchen',
      name: 'Island Kitchen & Utility',
      type: 'kitchen',
      x: 6.2,
      z: 4.0,
      width: 4.0,
      length: 3.5,
      ceilingHeight: 3.2,
      color: '#FEF3C7'
    },
    {
      id: 'room_master_bed',
      name: 'Grand Master Suite',
      type: 'master_bedroom',
      x: 0,
      z: 5.0,
      width: 5.0,
      length: 4.5,
      ceilingHeight: 3.2,
      color: '#EDE9FE'
    },
    {
      id: 'room_bed2',
      name: 'Guest Bedroom',
      type: 'bedroom_2',
      x: 5.0,
      z: 5.0,
      width: 4.0,
      length: 4.0,
      ceilingHeight: 3.2,
      color: '#DCFCE7'
    }
  ]
};
