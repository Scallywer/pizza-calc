export type YeastType = 'instant' | 'active-dry' | 'fresh' | 'sourdough-starter'
export type DoughMode = 'weight' | 'diameter'

export interface DoughInputs {
  mode: DoughMode
  pizzaCount: number
  targetWeight: number // total weight when mode === 'weight'
  diameterCm: number // per pizza when mode === 'diameter'
  hydrationPercent: number
  saltPercent: number
  oilPercent: number
  sugarPercent: number
  yeastPercent: number // expressed as % of flour for instant yeast baseline
  yeastType: YeastType
  thicknessFactor: number // grams per cm^2 for diameter mode
}

export interface DoughBreakdown {
  flour: number
  water: number
  salt: number
  oil: number
  sugar: number
  yeast: number
  totalDough: number
  perBall: number
}

const yeastMultipliers: Record<YeastType, number> = {
  instant: 1,
  'active-dry': 1.25,
  fresh: 2.5,
  'sourdough-starter': 20, // treat as preferment % of flour
}

export function estimateWeightFromDiameter(
  diameterCm: number,
  thicknessFactor: number,
): number {
  const radius = Math.max(diameterCm, 0) / 2
  const area = Math.PI * radius * radius
  return area * thicknessFactor
}

export function estimateWeightFromSquare(
  widthCm: number,
  heightCm: number,
  thicknessFactor: number,
): number {
  const area = Math.max(widthCm, 0) * Math.max(heightCm, 0)
  return area * thicknessFactor
}

export function deriveTotalWeight(inputs: DoughInputs): number {
  if (inputs.mode === 'diameter') {
    return (
      estimateWeightFromDiameter(inputs.diameterCm, inputs.thicknessFactor) *
      inputs.pizzaCount
    )
  }
  return Math.max(inputs.targetWeight, 0)
}

export function computeDough(inputs: DoughInputs): DoughBreakdown {
  const totalDough = deriveTotalWeight(inputs)
  const hydration = inputs.hydrationPercent / 100
  const salt = inputs.saltPercent / 100
  const oil = inputs.oilPercent / 100
  const sugar = inputs.sugarPercent / 100
  const yeastPercent = inputs.yeastPercent / 100
  const yeastFactor = yeastMultipliers[inputs.yeastType] ?? 1
  const yeast = yeastPercent * yeastFactor

  const divisor = 1 + hydration + salt + oil + sugar + yeast
  const flour = totalDough / divisor

  const water = flour * hydration
  const saltGrams = flour * salt
  const oilGrams = flour * oil
  const sugarGrams = flour * sugar
  const yeastGrams = flour * yeast
  const perBall = totalDough / Math.max(inputs.pizzaCount, 1)

  return {
    flour,
    water,
    salt: saltGrams,
    oil: oilGrams,
    sugar: sugarGrams,
    yeast: yeastGrams,
    totalDough,
    perBall,
  }
}

export function formatGrams(value: number): number {
  return Math.ceil(value)
}

/**
 * Suggest yeast percentage based on target fermentation time and dough temperature.
 * Baseline assumption: basePercent yields ~6h at 21°C with instant yeast.
 */
export function suggestYeastPercent({
  basePercent,
  targetHours,
  tempC,
}: {
  basePercent: number
  targetHours: number
  tempC: number
}): number {
  const baselineHours = 7 // at 21°C
  const hoursRatio = baselineHours / Math.max(targetHours, 0.5)
  const hoursFactor = Math.min(8, Math.max(0.3, Math.pow(hoursRatio, 1.05)))
  // colder needs more yeast; warmer needs less. 10°C colder ~1.6x, 10°C warmer ~0.65x
  const tempDelta = tempC - 21
  const tempFactor = Math.pow(0.65, tempDelta / 10)
  const suggested = basePercent * hoursFactor * tempFactor
  return Math.max(0.01, Math.min(5, suggested))
}

/**
 * Roughly estimate bake time in minutes based on oven temperature and thickness.
 * Baseline: 12 minutes at 250°C for a 0.36 thickness factor (NY-ish). Higher temps shorten time.
 */
export function estimateBakeMinutes(tempC: number, thicknessFactor: number): number {
  const baselineTemp = 250
  const baselineMinutes = 12
  const tempRatio = baselineTemp / Math.max(tempC, 180)
  const tempEffect = Math.pow(tempRatio, 0.7)
  const thicknessEffect = thicknessFactor / 0.36
  const minutes = baselineMinutes * tempEffect * thicknessEffect
  return Math.min(15, Math.max(1.5, Math.round(minutes * 10) / 10))
}

