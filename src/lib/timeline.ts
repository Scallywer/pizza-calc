export interface TimelineStep {
  time: Date
  label: string
  description: string
}

export interface TimelineInputs {
  useAutolyse: boolean
  autolyseMinutes: number
  bulkFermentHours: number
  finalProofHours: number
  fermentTempC: number
  flourGrams: number
  waterGrams: number
  saltGrams: number
  yeastGrams: number
  includeSugar: boolean
  pizzaCount: number
  effectiveOvenTemp: number
  bakeMinutes: number
}

export interface TimelineTranslations {
  stepMix: string
  stepAutolyse: string
  stepBulkFerment: string
  stepDivide: string
  stepFinalProof: string
  stepBake: string
  stepMixDesc: (params: { flour: number; water: number; salt: number; yeast: number; additions: string }) => string
  stepAutolyseDesc: string
  stepBulkFermentDesc: (params: { temp: number }) => string
  stepDivideDesc: (params: { count: number; plural: string }) => string
  stepFinalProofDesc: (params: { temp: number }) => string
  stepBakeDesc: (params: { temp: number; minutes: number }) => string
  sugar: string
  oil: string
}

/**
 * Calculate timeline steps for dough preparation
 */
export function calculateTimeline(
  inputs: TimelineInputs,
  startTime: Date = new Date(),
  t: TimelineTranslations
): TimelineStep[] {
  const steps: TimelineStep[] = []
  let currentTime = new Date(startTime)

  // Step 1: Autolyse (if enabled)
  if (inputs.useAutolyse) {
    steps.push({
      time: new Date(currentTime),
      label: t.stepAutolyse,
      description: t.stepAutolyseDesc,
    })
    currentTime = new Date(currentTime.getTime() + inputs.autolyseMinutes * 60000)
    const additions = (inputs.includeSugar ? `, ${t.sugar}` : '') + `, ${t.oil}`
    steps.push({
      time: new Date(currentTime),
      label: t.stepMix,
      description: t.stepMixDesc({
        flour: inputs.flourGrams,
        water: inputs.waterGrams,
        salt: inputs.saltGrams,
        yeast: inputs.yeastGrams,
        additions,
      }),
    })
  } else {
    const additions = (inputs.includeSugar ? `, ${t.sugar}` : '') + `, ${t.oil}`
    steps.push({
      time: new Date(currentTime),
      label: t.stepMix,
      description: t.stepMixDesc({
        flour: inputs.flourGrams,
        water: inputs.waterGrams,
        salt: inputs.saltGrams,
        yeast: inputs.yeastGrams,
        additions,
      }),
    })
  }

  // Step 2: Bulk fermentation
  currentTime = new Date(currentTime.getTime() + inputs.bulkFermentHours * 3600000)
  steps.push({
    time: new Date(currentTime),
    label: t.stepBulkFerment,
    description: t.stepBulkFermentDesc({ temp: inputs.fermentTempC }),
  })

  // Step 3: Divide
  steps.push({
    time: new Date(currentTime),
    label: t.stepDivide,
    description: t.stepDivideDesc({
      count: inputs.pizzaCount,
      plural: inputs.pizzaCount > 1 ? 'i' : 'u',
    }),
  })

  // Step 4: Final proof
  currentTime = new Date(currentTime.getTime() + inputs.finalProofHours * 3600000)
  steps.push({
    time: new Date(currentTime),
    label: t.stepFinalProof,
    description: t.stepFinalProofDesc({ temp: inputs.fermentTempC }),
  })

  // Step 5: Bake
  steps.push({
    time: new Date(currentTime),
    label: t.stepBake,
    description: t.stepBakeDesc({
      temp: inputs.effectiveOvenTemp,
      minutes: Math.ceil(inputs.bakeMinutes),
    }),
  })

  return steps
}

/**
 * Format duration between two times as a human-readable string
 */
export function formatDuration(startTime: Date, endTime: Date): string {
  const diffMs = endTime.getTime() - startTime.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) {
    return `+${diffMins} min`
  }
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  if (mins === 0) {
    return `+${hours}h`
  }
  return `+${hours}h ${mins}min`
}

/**
 * Calculate total timeline duration in minutes
 */
export function getTotalDuration(steps: TimelineStep[]): number {
  if (steps.length < 2) return 0
  const start = steps[0].time
  const end = steps[steps.length - 1].time
  return Math.floor((end.getTime() - start.getTime()) / 60000)
}

