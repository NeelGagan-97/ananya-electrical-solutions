import { ResidentialProject } from '../types/residentialDesigner';

export const STANDARD_2BHK_PROJECT: ResidentialProject = {
  id: 'proj_2bhk_photoreal_v5',
  meta: {
    projectName: 'Ananya Electrical Solutions — Photorealistic 2 BHK Smart Home',
    customerName: 'Shri R. Narasimha Rao',
    location: 'Sahakarnagar / Whitefield, Bengaluru',
    contactPhone: '+91 9632025123',
    date: new Date().toISOString().split('T')[0],
    unit: 'meters',
    plotWidth: 32.0,
    plotLength: 28.0,
    setbackFront: 3.5,
    setbackRear: 2.5,
    setbackLeft: 2.5,
    setbackRight: 2.5,
    floorHeight: 3.8,
    exteriorWallThickness: 0.23,
    interiorWallThickness: 0.12,
    supplyPhase: '3-phase 415V',
    sanctionedLoadKw: 9.5,
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
      id: 'room_balcony',
      name: 'Sit-Out Balcony',
      type: 'balcony',
      x: -3.2,
      z: 0.6,
      width: 3.2,
      length: 7.2,
      ceilingHeight: 3.8,
      color: '#DCFCE7'
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
      width: 6.4,
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
      id: 'room_bath2',
      name: 'Master Attached Bathroom',
      type: 'bathroom',
      x: -3.2,
      z: 10.6,
      width: 3.2,
      length: 5.4,
      ceilingHeight: 3.8,
      color: '#CCFBF1'
    },
    {
      id: 'room_bed2',
      name: 'Second Bedroom & Study',
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
      id: 'open_balcony_door',
      roomId: 'room_living',
      wallDirection: 'west',
      type: 'door',
      offset: 3.1,
      width: 2.2,
      height: 2.65,
      sillHeight: 0,
      swing: 'inside_left',
      label: 'Balcony Sliding Glass Door'
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
      id: 'open_bath2_door',
      roomId: 'room_master_bed',
      wallDirection: 'west',
      type: 'door',
      offset: 3.2,
      width: 1.5,
      height: 2.55,
      sillHeight: 0,
      swing: 'inside_right',
      label: 'Master Attached Bathroom Door'
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
      label: 'Second Bedroom Door'
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
      wallDirection: 'north',
      type: 'window',
      offset: 7.4,
      width: 2.8,
      height: 1.8,
      sillHeight: 0.85
    },
    {
      id: 'open_master_win',
      roomId: 'room_master_bed',
      wallDirection: 'south',
      type: 'window',
      offset: 2.4,
      width: 3.2,
      height: 1.8,
      sillHeight: 0.85
    },
    {
      id: 'open_bed2_win',
      roomId: 'room_bed2',
      wallDirection: 'east',
      type: 'window',
      offset: 2.2,
      width: 2.8,
      height: 1.7,
      sillHeight: 0.9
    },
    {
      id: 'open_kitchen_win',
      roomId: 'room_kitchen',
      wallDirection: 'east',
      type: 'window',
      offset: 1.5,
      width: 2.4,
      height: 1.4,
      sillHeight: 1.05
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
      name: 'Common Bathroom Entry Switchboard (Light, Exhaust & Geyser DP)',
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
      name: 'Common Bathroom IP65 LED + Exhaust Fan',
      x: 14.2,
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
      name: 'Common Bathroom 25L Storage Water Heater (20A DP Switch)',
      x: 17.22,
      y: 2.45,
      z: 6.9,
      circuitId: 'c6_bathroom_geyser',
      powerWatts: 2000,
      isOn: true,
      wallPlacement: 'east'
    },
    // Master Attached Bathroom Switchboard, Lighting, Exhaust & 25L Geyser
    {
      id: 'pt_bath2_sb',
      type: 'switch_board_6a',
      roomId: 'room_bath2',
      name: 'Master Bathroom Smart Switchboard (Mirror LED, Exhaust & Geyser)',
      x: -0.18,
      y: 1.35,
      z: 11.2,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 0,
      isOn: true,
      wallPlacement: 'east'
    },
    {
      id: 'pt_bath2_dl1',
      type: 'downlight_led',
      roomId: 'room_bath2',
      name: 'Master Bathroom IP65 Warm LED + Exhaust Fan',
      x: -1.6,
      y: 3.72,
      z: 13.3,
      circuitId: 'c2_bedroom_fan',
      powerWatts: 28,
      isOn: true,
      wallPlacement: 'ceiling'
    },
    {
      id: 'pt_bath2_geyser',
      type: 'geyser_point',
      roomId: 'room_bath2',
      name: 'Master Bathroom 25L Smart Water Heater (20A DP Switch)',
      x: -3.02,
      y: 2.45,
      z: 13.3,
      circuitId: 'c6_bathroom_geyser',
      powerWatts: 2000,
      isOn: true,
      wallPlacement: 'west'
    },
    // Living Room 2.0T Split Inverter AC
    {
      id: 'pt_living_ac',
      type: 'ac_isolator',
      roomId: 'room_living',
      name: 'Living Room 2.0 Ton Smart Split AC (25A DP Isolator)',
      x: 3.2,
      y: 2.95,
      z: 8.22,
      circuitId: 'c5_heavy_ac',
      powerWatts: 1850,
      isOn: true,
      wallPlacement: 'south'
    },
    // Balcony Outdoor Warm Wall & Ceiling Lighting
    {
      id: 'pt_balcony_dl1',
      type: 'downlight_led',
      roomId: 'room_balcony',
      name: 'Balcony IP65 Warm Outdoor Sconce & Ceiling Light',
      x: -1.6,
      y: 3.72,
      z: 4.2,
      circuitId: 'c1_living_lighting',
      powerWatts: 18,
      isOn: true,
      wallPlacement: 'ceiling'
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
      name: 'Living, Dining, Balcony & Kitchen Lighting Circuit',
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
        'pt_balcony_dl1',
        'pt_kitchen_sb',
        'pt_kitchen_dl1'
      ],
      maxCapacityWatts: 1800,
      description: 'Lighting & fan sub-circuit in 20mm concealed rigid PVC conduit feeding Living, Dining, Balcony, and Kitchen luminaires.'
    },
    {
      id: 'c2_bedroom_fan',
      code: 'C2',
      name: 'Bedrooms & Bathrooms Lighting + Fan Circuit',
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
        'pt_bath_dl1',
        'pt_bath2_sb',
        'pt_bath2_dl1'
      ],
      maxCapacityWatts: 1800,
      description: 'Concealed ceiling and wall PVC conduit circuit supplying Master Bedroom, Second Bedroom, and both IP65 Bathrooms.'
    },
    {
      id: 'c3_power_sockets',
      code: 'C3',
      name: 'Smart TV, Bedside & Study Desk 6A/16A Sockets',
      wireType: '2 × 2.5 sq.mm + 1 × 1.5 sq.mm PE FRLS Copper',
      phaseColor: '#F59E0B',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '16A SP Type-C MCB (10kA)',
      conduitSize: '25mm',
      connectedPointIds: ['pt_living_socket1', 'pt_master_socket', 'pt_bed2_socket'],
      maxCapacityWatts: 3680,
      description: 'Shuttered 3-pin socket outlets for 65" Smart TV entertainment unit, bedside lamps/chargers, and study desks.'
    },
    {
      id: 'c4_kitchen_power',
      code: 'C4',
      name: 'Kitchen Heavy Appliances (Hob, Chimney, Fridge, Oven)',
      wireType: '2 × 4.0 sq.mm + 1 × 2.5 sq.mm PE FRLS Copper',
      phaseColor: '#EF4444',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '20A SP Type-C MCB (10kA)',
      conduitSize: '25mm',
      connectedPointIds: ['pt_kitchen_socket1', 'pt_kitchen_socket2'],
      maxCapacityWatts: 4600,
      description: 'Dedicated high-load kitchen circuit for built-in hob, auto-clean chimney, microwave, oven, and double-door refrigerator.'
    },
    {
      id: 'c5_heavy_ac',
      code: 'C5',
      name: 'Smart Split Air-Conditioners (Living, Master & Second Bed)',
      wireType: '2 × 4.0 sq.mm + 1 × 2.5 sq.mm PE FRLS Copper',
      phaseColor: '#A855F7',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '25A SP Type-C MCB (10kA)',
      conduitSize: '25mm',
      connectedPointIds: ['pt_living_ac', 'pt_master_ac', 'pt_bed2_ac'],
      maxCapacityWatts: 6200,
      description: 'Direct homerun circuit from TPN DB to 20A/25A rotary AC isolators with surge isolation.'
    },
    {
      id: 'c6_bathroom_geyser',
      code: 'C6',
      name: 'Both Bathrooms 25L Storage Water Heaters (Geysers)',
      wireType: '2 × 4.0 sq.mm + 1 × 2.5 sq.mm PE FRLS Copper',
      phaseColor: '#EC4899',
      neutralColor: '#1E293B',
      earthColor: '#10B981',
      mcbRating: '20A 30mA RCBO (Type-A)',
      conduitSize: '25mm',
      connectedPointIds: ['pt_bath_geyser', 'pt_bath2_geyser'],
      maxCapacityWatts: 4500,
      description: 'Dedicated wet-zone heating circuit protected by a 30mA RCBO and double-pole indicator switches in both bathrooms.'
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

export const METERS_TO_FEET = 3.28084;
export const SQM_TO_SQFT = 10.7639;

export function metersToFeet(m: number): number {
  return Number((m * METERS_TO_FEET).toFixed(1));
}

export function feetToMeters(ft: number): number {
  return Number((ft / METERS_TO_FEET).toFixed(2));
}

export function getApartmentFootprintMetrics(project: ResidentialProject) {
  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;
  let carpetAreaSqM = 0;

  project.rooms.forEach((r) => {
    minX = Math.min(minX, r.x);
    maxX = Math.max(maxX, r.x + r.width);
    minZ = Math.min(minZ, r.z);
    maxZ = Math.max(maxZ, r.z + r.length);
    carpetAreaSqM += r.width * r.length;
  });

  if (!isFinite(minX)) {
    minX = 0;
    maxX = 17.4;
    minZ = -3.6;
    maxZ = 16.0;
  }

  const breadthM = Number((maxX - minX).toFixed(2));
  const lengthM = Number((maxZ - minZ).toFixed(2));
  const breadthFt = metersToFeet(breadthM);
  const lengthFt = metersToFeet(lengthM);
  const carpetAreaSqFt = Math.round(carpetAreaSqM * SQM_TO_SQFT);
  const footprintAreaSqM = Number((breadthM * lengthM).toFixed(1));
  const footprintAreaSqFt = Math.round(footprintAreaSqM * SQM_TO_SQFT);

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    breadthM,
    lengthM,
    breadthFt,
    lengthFt,
    carpetAreaSqM: Number(carpetAreaSqM.toFixed(1)),
    carpetAreaSqFt,
    footprintAreaSqM,
    footprintAreaSqFt
  };
}

/**
 * Parametrically scales a ResidentialProject (all rooms, shared walls, doors, windows,
 * concealed conduit endpoints, switches, sockets, fans, and downlights) to any user-specified
 * overall Breadth (Width, X-axis) and Length (Depth, Z-axis) in meters.
 */
export function scaleResidentialProjectToDimensions(
  sourceProject: ResidentialProject,
  targetBreadthM: number,
  targetLengthM: number,
  targetCeilingHeightM?: number
): ResidentialProject {
  const clampedBreadthM = Math.max(7.5, Math.min(45.0, targetBreadthM));
  const clampedLengthM = Math.max(8.0, Math.min(50.0, targetLengthM));
  const metrics = getApartmentFootprintMetrics(sourceProject);

  const scaleX = clampedBreadthM / Math.max(1, metrics.breadthM);
  const scaleZ = clampedLengthM / Math.max(1, metrics.lengthM);
  const nextCeilH = Number(
    Math.max(2.7, Math.min(5.5, targetCeilingHeightM ?? sourceProject.meta.floorHeight ?? 3.8)).toFixed(2)
  );

  const oldRoomMap = new Map(sourceProject.rooms.map((r) => [r.id, r]));

  // 1. Scale Rooms proportionally while keeping shared walls aligned
  const newRooms = sourceProject.rooms.map((r) => {
    const newX = Number(((r.x - metrics.minX) * scaleX + metrics.minX).toFixed(2));
    const newZ = Number((r.z * scaleZ).toFixed(2));
    const newW = Number(Math.max(2.0, r.width * scaleX).toFixed(2));
    const newL = Number(Math.max(2.0, r.length * scaleZ).toFixed(2));
    return {
      ...r,
      x: newX,
      z: newZ,
      width: newW,
      length: newL,
      ceilingHeight: nextCeilH
    };
  });

  const newRoomMap = new Map(newRooms.map((r) => [r.id, r]));

  // 2. Scale Door & Window Openings along their host walls
  const newOpenings = sourceProject.openings.map((op) => {
    const oldRm = oldRoomMap.get(op.roomId);
    const newRm = newRoomMap.get(op.roomId);
    if (!oldRm || !newRm) return op;

    const isHoriz = op.wallDirection === 'north' || op.wallDirection === 'south';
    const oldWallLen = isHoriz ? oldRm.width : oldRm.length;
    const newWallLen = isHoriz ? newRm.width : newRm.length;
    const wallRatio = newWallLen / Math.max(0.5, oldWallLen);

    let nextWidth = op.width;
    if (op.type === 'door') {
      // Keep doors realistic (between 0.95m and 2.1m) and fitting inside the wall
      nextWidth = Number(
        Math.min(Math.max(0.95, op.width * Math.pow(wallRatio, 0.65)), Math.max(0.9, newWallLen - 0.35)).toFixed(2)
      );
    } else {
      nextWidth = Number(
        Math.min(Math.max(0.75, op.width * wallRatio), Math.max(0.75, newWallLen - 0.4)).toFixed(2)
      );
    }

    const rawOffset = op.offset * wallRatio;
    const nextOffset = Number(
      Math.max(0.15, Math.min(Math.max(0.15, newWallLen - nextWidth - 0.15), rawOffset)).toFixed(2)
    );
    const nextHeight =
      op.type === 'door'
        ? Number(Math.min(nextCeilH - 0.45, Math.max(2.1, op.height)).toFixed(2))
        : op.height;

    return {
      ...op,
      offset: nextOffset,
      width: nextWidth,
      height: nextHeight
    };
  });

  // 3. Reposition Electrical Points so wall-mounted switches/sockets/DB stay flush on walls
  // and ceiling lights/fans stay centered in their scaled rooms
  const newElectricalPoints = sourceProject.electricalPoints.map((pt) => {
    const oldRm = oldRoomMap.get(pt.roomId);
    const newRm = newRoomMap.get(pt.roomId);

    if (pt.type === 'earth_pit') {
      const foyer = newRooms.find((r) => r.type === 'foyer') || newRooms[0];
      return {
        ...pt,
        x: Number((foyer.x - 1.8).toFixed(2)),
        y: 0.05,
        z: Number((foyer.z + foyer.length * 0.35).toFixed(2))
      };
    }

    if (!oldRm || !newRm) {
      return {
        ...pt,
        x: Number((pt.x * scaleX).toFixed(2)),
        z: Number((pt.z * scaleZ).toFixed(2))
      };
    }

    const relX = Math.max(0.05, Math.min(0.95, (pt.x - oldRm.x) / Math.max(0.5, oldRm.width)));
    const relZ = Math.max(0.05, Math.min(0.95, (pt.z - oldRm.z) / Math.max(0.5, oldRm.length)));

    let nextX = newRm.x + relX * newRm.width;
    let nextZ = newRm.z + relZ * newRm.length;
    let nextY = pt.y;

    if (pt.wallPlacement === 'west') {
      nextX = newRm.x + 0.18;
    } else if (pt.wallPlacement === 'east') {
      nextX = newRm.x + newRm.width - 0.18;
    } else if (pt.wallPlacement === 'north') {
      nextZ = newRm.z + 0.18;
    } else if (pt.wallPlacement === 'south') {
      nextZ = newRm.z + newRm.length - 0.18;
    } else if (pt.wallPlacement === 'ceiling') {
      nextY = pt.type === 'ceiling_fan' ? nextCeilH - 0.38 : nextCeilH - 0.08;
    }

    if (pt.type === 'ac_isolator' || pt.type === 'geyser_point') {
      nextY = Math.min(nextCeilH - 0.55, pt.y);
    }

    return {
      ...pt,
      x: Number(nextX.toFixed(2)),
      y: Number(nextY.toFixed(2)),
      z: Number(nextZ.toFixed(2))
    };
  });

  const newMetrics = getApartmentFootprintMetrics({
    ...sourceProject,
    rooms: newRooms
  });

  return {
    ...sourceProject,
    meta: {
      ...sourceProject.meta,
      plotWidth: Number((newMetrics.breadthM + 8.0).toFixed(1)),
      plotLength: Number((newMetrics.lengthM + 8.0).toFixed(1)),
      floorHeight: nextCeilH
    },
    rooms: newRooms,
    openings: newOpenings,
    electricalPoints: newElectricalPoints
  };
}

/**
 * Updates a single room's Breadth (Width, X) and Length (Depth, Z) while shifting
 * adjacent rooms along shared walls and keeping all doors, windows, and electrical points aligned.
 */
export function updateSingleRoomDimensions(
  project: ResidentialProject,
  roomId: string,
  newBreadthM: number,
  newLengthM: number
): ResidentialProject {
  const targetRoom = project.rooms.find((r) => r.id === roomId);
  if (!targetRoom) return project;

  const clampedW = Number(Math.max(2.0, Math.min(25.0, newBreadthM)).toFixed(2));
  const clampedL = Number(Math.max(2.0, Math.min(25.0, newLengthM)).toFixed(2));
  const deltaW = clampedW - targetRoom.width;
  const deltaL = clampedL - targetRoom.length;

  const oldRoomMap = new Map(project.rooms.map((r) => [r.id, r]));
  const oldRightEdge = targetRoom.x + targetRoom.width;
  const oldBottomEdge = targetRoom.z + targetRoom.length;

  const updatedRooms = project.rooms.map((r) => {
    if (r.id === roomId) {
      return {
        ...r,
        width: clampedW,
        length: clampedL
      };
    }

    let nextX = r.x;
    let nextZ = r.z;

    // Shift rooms immediately to the East of this room if they share its East wall
    const zOverlap =
      Math.min(r.z + r.length, oldBottomEdge) - Math.max(r.z, targetRoom.z) > 0.2;
    if (Math.abs(r.x - oldRightEdge) < 0.25 && zOverlap) {
      nextX = Number((r.x + deltaW).toFixed(2));
    }

    // Shift rooms immediately to the South of this room if they share its South wall
    const xOverlap =
      Math.min(r.x + r.width, oldRightEdge) - Math.max(r.x, targetRoom.x) > 0.2;
    if (Math.abs(r.z - oldBottomEdge) < 0.25 && xOverlap) {
      nextZ = Number((r.z + deltaL).toFixed(2));
    }

    return {
      ...r,
      x: nextX,
      z: nextZ
    };
  });

  const newRoomMap = new Map(updatedRooms.map((r) => [r.id, r]));

  // Re-align openings for any room whose position or size changed
  const updatedOpenings = project.openings.map((op) => {
    const oldRm = oldRoomMap.get(op.roomId);
    const newRm = newRoomMap.get(op.roomId);
    if (!oldRm || !newRm) return op;

    const isHoriz = op.wallDirection === 'north' || op.wallDirection === 'south';
    const oldWallLen = isHoriz ? oldRm.width : oldRm.length;
    const newWallLen = isHoriz ? newRm.width : newRm.length;
    if (Math.abs(oldWallLen - newWallLen) < 0.01) return op;

    const wallRatio = newWallLen / Math.max(0.5, oldWallLen);
    const nextWidth = Number(
      Math.min(op.width, Math.max(0.8, newWallLen - 0.35)).toFixed(2)
    );
    const nextOffset = Number(
      Math.max(0.15, Math.min(Math.max(0.15, newWallLen - nextWidth - 0.15), op.offset * wallRatio)).toFixed(2)
    );
    return {
      ...op,
      width: nextWidth,
      offset: nextOffset
    };
  });

  // Re-align electrical points inside any modified/shifted room
  const updatedPoints = project.electricalPoints.map((pt) => {
    if (pt.type === 'earth_pit') return pt;
    const oldRm = oldRoomMap.get(pt.roomId);
    const newRm = newRoomMap.get(pt.roomId);
    if (!oldRm || !newRm) return pt;

    const relX = Math.max(0.05, Math.min(0.95, (pt.x - oldRm.x) / Math.max(0.5, oldRm.width)));
    const relZ = Math.max(0.05, Math.min(0.95, (pt.z - oldRm.z) / Math.max(0.5, oldRm.length)));

    let nextX = newRm.x + relX * newRm.width;
    let nextZ = newRm.z + relZ * newRm.length;

    if (pt.wallPlacement === 'west') nextX = newRm.x + 0.18;
    else if (pt.wallPlacement === 'east') nextX = newRm.x + newRm.width - 0.18;
    else if (pt.wallPlacement === 'north') nextZ = newRm.z + 0.18;
    else if (pt.wallPlacement === 'south') nextZ = newRm.z + newRm.length - 0.18;

    return {
      ...pt,
      x: Number(nextX.toFixed(2)),
      z: Number(nextZ.toFixed(2))
    };
  });

  const newMetrics = getApartmentFootprintMetrics({
    ...project,
    rooms: updatedRooms
  });

  return {
    ...project,
    meta: {
      ...project.meta,
      plotWidth: Number((newMetrics.breadthM + 8.0).toFixed(1)),
      plotLength: Number((newMetrics.lengthM + 8.0).toFixed(1))
    },
    rooms: updatedRooms,
    openings: updatedOpenings,
    electricalPoints: updatedPoints
  };
}

export interface PlotDimensionPreset {
  id: string;
  label: string;
  sublabel: string;
  breadthFt: number;
  lengthFt: number;
  breadthM: number;
  lengthM: number;
  ceilingHeightM: number;
}

export const PLOT_DIMENSION_PRESETS: PlotDimensionPreset[] = [
  {
    id: 'classic_1000',
    label: 'Classic 1,000 sq.ft 2BHK',
    sublabel: '34 ft × 38 ft (10.4m × 11.6m)',
    breadthFt: 34,
    lengthFt: 38,
    breadthM: 10.36,
    lengthM: 11.58,
    ceilingHeightM: 3.2
  },
  {
    id: 'compact_spacious',
    label: 'Urban Spacious 2BHK',
    sublabel: '46 ft × 52 ft (14.0m × 15.8m)',
    breadthFt: 46,
    lengthFt: 52,
    breadthM: 14.02,
    lengthM: 15.85,
    ceilingHeightM: 3.6
  },
  {
    id: 'standard_grand',
    label: 'Grand Walkthrough 2BHK',
    sublabel: '57 ft × 64 ft (17.4m × 19.6m)',
    breadthFt: 57.1,
    lengthFt: 64.3,
    breadthM: 17.4,
    lengthM: 19.6,
    ceilingHeightM: 3.8
  },
  {
    id: 'villa_palatial',
    label: 'Palatial Villa 2BHK Duplex',
    sublabel: '72 ft × 80 ft (22.0m × 24.4m)',
    breadthFt: 72,
    lengthFt: 80,
    breadthM: 21.95,
    lengthM: 24.38,
    ceilingHeightM: 4.2
  }
];

export const COMPACT_2BHK_PROJECT: ResidentialProject = (() => {
  const scaled = scaleResidentialProjectToDimensions(STANDARD_2BHK_PROJECT, 14.0, 15.8, 3.6);
  return {
    ...scaled,
    id: 'proj_2bhk_compact_spacious',
    meta: {
      ...scaled.meta,
      projectName: 'Urban Nest 2BHK Spacious (14.0m × 15.8m)',
      customerName: 'Smt. Priya Sundaram',
      location: 'Electronic City, Bengaluru',
      sanctionedLoadKw: 6.0
    }
  };
})();

export const LUXURY_3BHK_PROJECT: ResidentialProject = (() => {
  const scaled = scaleResidentialProjectToDimensions(STANDARD_2BHK_PROJECT, 21.5, 24.0, 4.1);
  return {
    ...scaled,
    id: 'proj_3bhk_luxury_spacious',
    meta: {
      ...scaled.meta,
      projectName: 'Prestige Villa Grand 2BHK/3BHK Duplex (21.5m × 24.0m)',
      customerName: 'Dr. Vikram Malhotra',
      location: 'Sadashivanagar, Bengaluru',
      sanctionedLoadKw: 12.0,
      supplyPhase: '3-phase 415V'
    }
  };
})();

export const RESIDENTIAL_TEMPLATES = [
  {
    id: '2bhk',
    badge: '2BHK GRAND',
    name: 'Greenwood Heights Grand 2BHK (57×64 ft)',
    project: STANDARD_2BHK_PROJECT
  },
  {
    id: '2bhk_compact',
    badge: '2BHK URBAN',
    name: 'Urban Nest 2BHK (46×52 ft)',
    project: COMPACT_2BHK_PROJECT
  },
  {
    id: '3bhk_luxury',
    badge: '2BHK VILLA',
    name: 'Prestige Villa Duplex (71×79 ft)',
    project: LUXURY_3BHK_PROJECT
  }
];


