import type { YeastType } from '../lib/calculator'

export interface DoughPreset {
  id: string
  name: string
  description: string
  defaultHydration: number
  saltPercent: number
  oilPercent: number
  sugarPercent: number
  yeastPercent: number
  defaultYeastType: YeastType
  ovenTempC: number
  defaultDiameterCm: number
  thicknessFactor: number
}

export const DOUGH_PRESETS: DoughPreset[] = [
  {
    id: 'neapolitan',
    name: 'Neapolitan',
    description: 'Soft cornicione, high heat, short bake.',
    defaultHydration: 63,
    saltPercent: 2.8,
    oilPercent: 1,
    sugarPercent: 0,
    yeastPercent: 0.2,
    defaultYeastType: 'fresh',
    ovenTempC: 450,
    defaultDiameterCm: 30,
    thicknessFactor: 0.33,
  },
  {
    id: 'new-york',
    name: 'New York',
    description: 'Balanced chew, moderate oil, home/gas oven friendly.',
    defaultHydration: 65,
    saltPercent: 2.2,
    oilPercent: 3,
    sugarPercent: 1.5,
    yeastPercent: 0.35,
    defaultYeastType: 'instant',
    ovenTempC: 290,
    defaultDiameterCm: 35,
    thicknessFactor: 0.36,
  },
  {
    id: 'detroit',
    name: 'Detroit',
    description: 'Pan pizza, airy crumb, caramelized cheese edge.',
    defaultHydration: 70,
    saltPercent: 2.6,
    oilPercent: 5,
    sugarPercent: 1,
    yeastPercent: 0.6,
    defaultYeastType: 'instant',
    ovenTempC: 255,
    defaultDiameterCm: 25,
    thicknessFactor: 0.45,
  },
  {
    id: 'sicilian',
    name: 'Sicilian',
    description: 'Thick, fluffy, generous oil in the pan.',
    defaultHydration: 68,
    saltPercent: 2.5,
    oilPercent: 4,
    sugarPercent: 1.2,
    yeastPercent: 0.5,
    defaultYeastType: 'active-dry',
    ovenTempC: 245,
    defaultDiameterCm: 30,
    thicknessFactor: 0.44,
  },
  {
    id: 'roman',
    name: 'Roman al Taglio',
    description: 'Crisp bottom, light interior, high hydration.',
    defaultHydration: 72,
    saltPercent: 2.7,
    oilPercent: 3,
    sugarPercent: 1,
    yeastPercent: 0.4,
    defaultYeastType: 'instant',
    ovenTempC: 260,
    defaultDiameterCm: 30,
    thicknessFactor: 0.4,
  },
  {
    id: 'focaccia',
    name: 'Focaccia',
    description: 'Olive oil rich, open crumb, sheeted.',
    defaultHydration: 75,
    saltPercent: 2.8,
    oilPercent: 6,
    sugarPercent: 1,
    yeastPercent: 0.6,
    defaultYeastType: 'active-dry',
    ovenTempC: 230,
    defaultDiameterCm: 30,
    thicknessFactor: 0.42,
  },
  {
    id: 'sourdough-country',
    name: 'Sourdough Country',
    description: 'Hybrid pizza/bread feel, longer fermentation.',
    defaultHydration: 70,
    saltPercent: 2.5,
    oilPercent: 1,
    sugarPercent: 0,
    yeastPercent: 20, // starter %
    defaultYeastType: 'sourdough-starter',
    ovenTempC: 260,
    defaultDiameterCm: 32,
    thicknessFactor: 0.35,
  },
  {
    id: 'grandma',
    name: 'Grandma',
    description: 'Thin pan pie, crisp bottom, moderate oil.',
    defaultHydration: 67,
    saltPercent: 2.4,
    oilPercent: 4,
    sugarPercent: 1.5,
    yeastPercent: 0.45,
    defaultYeastType: 'instant',
    ovenTempC: 245,
    defaultDiameterCm: 28,
    thicknessFactor: 0.34,
  },
]

export const yeastOptions: { value: YeastType; label: string }[] = [
  { value: 'instant', label: 'Instant / IDY' },
  { value: 'active-dry', label: 'Active Dry' },
  { value: 'fresh', label: 'Fresh / Cake' },
  { value: 'sourdough-starter', label: 'Sourdough Starter' },
]

