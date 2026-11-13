// ============================================================
// data/missions.ts — Mission definitions and configurations
// ============================================================

import type { MissionConfig } from '../types';

export const MISSIONS: Record<string, MissionConfig> = {
  'earth-observation': {
    id: 'earth-observation',
    name: 'EarthWatch-1',
    subtitle: 'Earth Observation Satellite',
    description: 'Deploy a multi-spectral Earth observation satellite to low Earth orbit. Your spacecraft must image agricultural regions, monitor deforestation, and track sea surface temperatures to support climate research and disaster response.',
    destination: 'Low Earth Orbit (500 km)',
    duration: 730, // 2 years
    budgetLimit: 120,
    difficulty: 'Beginner',
    icon: '🌍',
    color: '#22d3ee',
    backgroundInfo: `Earth observation satellites play a critical role in monitoring our planet's health. 
    Orbiting at 400–600 km altitude, they can image the same area every few days.
    The challenge: balancing image resolution, coverage area, data storage, and power.
    
    Real missions like Landsat 9, Sentinel-2, and MODIS provide the scientific baseline.`,
    objectives: [
      {
        id: 'obj-imaging',
        description: 'Capture high-resolution images of 90% of target agricultural zones',
        requiredInstruments: ['inst-camera'],
        completed: false,
        partialProgress: 0,
        pointValue: 30,
      },
      {
        id: 'obj-multispectral',
        description: 'Collect multispectral atmospheric & surface data',
        requiredInstruments: ['inst-spectrometer'],
        completed: false,
        partialProgress: 0,
        pointValue: 25,
      },
      {
        id: 'obj-downlink',
        description: 'Downlink at least 500 GB of scientific data to Earth',
        requiredInstruments: [],
        completed: false,
        partialProgress: 0,
        pointValue: 20,
      },
      {
        id: 'obj-duration',
        description: 'Operate for at least 18 months in orbit',
        requiredInstruments: [],
        completed: false,
        partialProgress: 0,
        pointValue: 25,
      },
    ],
    requiredComponents: ['lv-falcon9', 'lv-atlas5', 'lv-electron'],
    recommendedComponents: ['inst-camera', 'inst-spectrometer', 'pwr-solar-medium', 'ant-xband'],
    deltaVRequirement: 200,
  },

  'lunar-exploration': {
    id: 'lunar-exploration',
    name: 'LunaMapper',
    subtitle: 'Lunar Orbital Science Mission',
    description: 'Send a spacecraft to lunar orbit to map the Moon\'s surface in unprecedented detail. Identify water ice deposits in permanently shadowed craters at the South Pole and map potential landing sites for future human exploration.',
    destination: 'Lunar Orbit (100 km)',
    duration: 365,
    budgetLimit: 350,
    difficulty: 'Intermediate',
    icon: '🌕',
    color: '#a78bfa',
    backgroundInfo: `The Moon holds secrets about early Solar System history and water ice crucial for future exploration.
    Lunar Reconnaissance Orbiter (LRO) and Chandrayaan-3 have already revealed promising ice deposits.
    
    Your mission must survive the 3-day transit, lunar orbit insertion, and year-long operations
    in an environment with no atmosphere, radiation bombardment, and extreme temperature swings.`,
    objectives: [
      {
        id: 'obj-surface-map',
        description: 'Complete global surface map at 10m resolution',
        requiredInstruments: ['inst-camera', 'inst-laser-altimeter'],
        completed: false,
        partialProgress: 0,
        pointValue: 30,
      },
      {
        id: 'obj-water-ice',
        description: 'Detect and characterize water ice in polar craters',
        requiredInstruments: ['inst-spectrometer'],
        completed: false,
        partialProgress: 0,
        pointValue: 35,
      },
      {
        id: 'obj-magnetic-map',
        description: 'Map lunar magnetic field anomalies',
        requiredInstruments: ['inst-magnetometer'],
        completed: false,
        partialProgress: 0,
        pointValue: 20,
      },
      {
        id: 'obj-gravity',
        description: 'Measure lunar gravity field variations',
        requiredInstruments: ['inst-radio-science'],
        completed: false,
        partialProgress: 0,
        pointValue: 15,
      },
    ],
    requiredComponents: [],
    recommendedComponents: ['inst-camera', 'inst-laser-altimeter', 'inst-spectrometer', 'ant-dsn', 'thm-active'],
    deltaVRequirement: 900, // Trans-lunar + orbital insertion
  },

  'lunar-landing': {
    id: 'lunar-landing',
    name: 'Artemis Scout',
    subtitle: 'Lunar Surface Lander',
    description: 'Design and land a scientific lander near the lunar South Pole. Deploy instruments to study the regolith composition, detect seismic activity, measure thermal gradients, and characterize the local environment for future human missions.',
    destination: 'Lunar South Pole Surface',
    duration: 180, // 6 months — limited by battery/power at poles
    budgetLimit: 600,
    difficulty: 'Advanced',
    icon: '🌗',
    color: '#f59e0b',
    backgroundInfo: `Landing on the Moon is one of humanity's greatest engineering challenges.
    The lunar South Pole is scientifically priceless but technically demanding:
    permanent sunlight at some peaks, permanent shadow in craters, extreme terrain.
    
    India's Chandrayaan-3 successfully landed near the South Pole in 2023.
    Your lander must survive the descent, deploy instruments, and operate through the frigid lunar night.`,
    objectives: [
      {
        id: 'obj-soft-landing',
        description: 'Execute a successful soft landing within 2 km of target site',
        requiredInstruments: ['inst-laser-altimeter'],
        completed: false,
        partialProgress: 0,
        pointValue: 35,
      },
      {
        id: 'obj-seismic',
        description: 'Detect and characterize at least 3 seismic events',
        requiredInstruments: ['inst-seismometer'],
        completed: false,
        partialProgress: 0,
        pointValue: 25,
      },
      {
        id: 'obj-drill',
        description: 'Collect and analyze subsurface regolith samples to 50 cm depth',
        requiredInstruments: ['inst-drill', 'inst-spectrometer'],
        completed: false,
        partialProgress: 0,
        pointValue: 25,
      },
      {
        id: 'obj-weather',
        description: 'Operate for at least 30 days and survive one lunar night',
        requiredInstruments: [],
        completed: false,
        partialProgress: 0,
        pointValue: 15,
      },
    ],
    requiredComponents: [],
    recommendedComponents: ['inst-seismometer', 'inst-drill', 'inst-spectrometer', 'thm-active', 'pwr-rtu'],
    deltaVRequirement: 2100, // LOI + descent
  },

  'planetary-science': {
    id: 'planetary-science',
    name: 'MarsSpy',
    subtitle: 'Mars Orbital Science Mission',
    description: 'Send a sophisticated orbiter to Mars to study its climate, geology, and search for biosignatures. Map methane plumes, characterize dust storms, and identify subsurface water using ground-penetrating radar.',
    destination: 'Mars Orbit (300 km)',
    duration: 1460, // 4 years including transit
    budgetLimit: 900,
    difficulty: 'Expert',
    icon: '🔴',
    color: '#ef4444',
    backgroundInfo: `Mars holds the key to understanding whether life could exist beyond Earth.
    The 7-month journey to Mars requires precise trajectory planning. 
    Mars missions only launch every 26 months when Earth and Mars align (launch windows).
    
    Like MRO, MAVEN, and Mars Express, your spacecraft must survive the 6-month cruise,
    Mars Orbit Insertion, and years of operations 200 million km from Earth.
    Communication delays of up to 24 minutes make autonomous operation essential.`,
    objectives: [
      {
        id: 'obj-methane',
        description: 'Map global methane distribution to identify active geological or biological sources',
        requiredInstruments: ['inst-spectrometer'],
        completed: false,
        partialProgress: 0,
        pointValue: 30,
      },
      {
        id: 'obj-subsurface',
        description: 'Map subsurface water/ice deposits using radar',
        requiredInstruments: ['inst-sar'],
        completed: false,
        partialProgress: 0,
        pointValue: 30,
      },
      {
        id: 'obj-climate',
        description: 'Monitor dust storms and climate patterns through one full Martian year',
        requiredInstruments: ['inst-camera', 'inst-spectrometer'],
        completed: false,
        partialProgress: 0,
        pointValue: 25,
      },
      {
        id: 'obj-gravity-map',
        description: 'Refine Mars gravity field model for future landing site selection',
        requiredInstruments: ['inst-radio-science'],
        completed: false,
        partialProgress: 0,
        pointValue: 15,
      },
    ],
    requiredComponents: [],
    recommendedComponents: ['inst-spectrometer', 'inst-sar', 'inst-camera', 'ant-hga', 'thm-active'],
    deltaVRequirement: 2800, // Mars transfer + insertion
  },
};

export const MISSION_ORDER: string[] = [
  'earth-observation',
  'lunar-exploration',
  'lunar-landing',
  'planetary-science',
];

