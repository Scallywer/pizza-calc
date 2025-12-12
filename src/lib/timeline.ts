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
  includeSugar: boolean
  pizzaCount: number
  effectiveOvenTemp: number
  bakeMinutes: number
}

/**
 * Calculate timeline steps for dough preparation
 */
export function calculateTimeline(inputs: TimelineInputs, startTime: Date = new Date()): TimelineStep[] {
  const steps: TimelineStep[] = []
  let currentTime = new Date(startTime)

  // Step 1: Autolyse (if enabled)
  if (inputs.useAutolyse) {
    steps.push({
      time: new Date(currentTime),
      label: 'Start autolyse',
      description: `Mix flour (${inputs.flourGrams}g) + water (${inputs.waterGrams}g). Let rest.`,
    })
    currentTime = new Date(currentTime.getTime() + inputs.autolyseMinutes * 60000)
    steps.push({
      time: new Date(currentTime),
      label: 'End autolyse',
      description: 'Add salt, yeast, oil' + (inputs.includeSugar ? ', sugar' : '') + '. Mix until smooth.',
    })
  } else {
    steps.push({
      time: new Date(currentTime),
      label: 'Mix dough',
      description: `Combine all ingredients. Mix until smooth and elastic.`,
    })
  }

  // Step 2: Bulk fermentation
  currentTime = new Date(currentTime.getTime() + inputs.bulkFermentHours * 3600000)
  steps.push({
    time: new Date(currentTime),
    label: 'End bulk fermentation',
    description: `Ferment at ${inputs.fermentTempC}°C. Dough should rise ~50-75%. Divide into ${inputs.pizzaCount} ball${inputs.pizzaCount > 1 ? 's' : ''} and shape.`,
  })

  // Step 3: Final proof
  currentTime = new Date(currentTime.getTime() + inputs.finalProofHours * 3600000)
  steps.push({
    time: new Date(currentTime),
    label: 'Ready to bake',
    description: `Final proof complete. Preheat oven to ${inputs.effectiveOvenTemp}°C. Bake for ~${Math.ceil(inputs.bakeMinutes)} minutes.`,
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

