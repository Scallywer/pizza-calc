import { describe, expect, it } from 'vitest'
import { calculateTimeline, formatDuration, getTotalDuration } from './timeline'
import type { TimelineInputs } from './timeline'

const baseInputs: TimelineInputs = {
  useAutolyse: false,
  autolyseMinutes: 30,
  bulkFermentHours: 2,
  finalProofHours: 1,
  fermentTempC: 20,
  flourGrams: 500,
  waterGrams: 325,
  saltGrams: 12,
  yeastGrams: 2,
  includeSugar: true,
  pizzaCount: 2,
  effectiveOvenTemp: 250,
  bakeMinutes: 12,
}

const mockTranslations = {
  stepMix: 'Mix dough',
  stepAutolyse: 'Start autolyse',
  stepBulkFerment: 'End bulk fermentation',
  stepDivide: 'Divide & shape',
  stepFinalProof: 'Final proof',
  stepBake: 'Bake',
  stepMixDesc: (params: { flour: number; water: number; salt: number; yeast: number; additions: string }) =>
    `Combine ${params.flour}g flour, ${params.water}g water, ${params.salt}g salt, ${params.yeast}g yeast${params.additions}`,
  stepAutolyseDesc: 'Rest flour and water only',
  stepBulkFermentDesc: (params: { temp: number }) => `First rise at ${params.temp}°C`,
  stepDivideDesc: (params: { count: number; plural: string }) => `Divide into ${params.count} ball${params.plural}`,
  stepFinalProofDesc: (params: { temp: number }) => `Second rise at ${params.temp}°C`,
  stepBakeDesc: (params: { temp: number; minutes: number }) => `Bake at ${params.temp}°C for ${params.minutes} minutes`,
  sugar: 'sugar',
  oil: 'oil',
}

describe('timeline', () => {
  it('calculates timeline without autolyse', () => {
    const startTime = new Date('2024-01-01T10:00:00Z')
    const steps = calculateTimeline(baseInputs, startTime, mockTranslations)

    expect(steps).toHaveLength(3)
    expect(steps[0].label).toBe('Mix dough')
    expect(steps[1].label).toBe('End bulk fermentation')
    expect(steps[2].label).toBe('Ready to bake')

    // Check timing
    expect(steps[0].time.getTime()).toBe(startTime.getTime())
    expect(steps[1].time.getTime()).toBe(startTime.getTime() + 2 * 3600000) // +2 hours
    expect(steps[2].time.getTime()).toBe(startTime.getTime() + 3 * 3600000) // +3 hours total
  })

  it('calculates timeline with autolyse', () => {
    const inputs: TimelineInputs = {
      ...baseInputs,
      useAutolyse: true,
      autolyseMinutes: 30,
    }
    const startTime = new Date('2024-01-01T10:00:00Z')
    const steps = calculateTimeline(inputs, startTime, mockTranslations)

    expect(steps).toHaveLength(4)
    expect(steps[0].label).toBe('Start autolyse')
    expect(steps[1].label).toBe('End autolyse')
    expect(steps[2].label).toBe('End bulk fermentation')
    expect(steps[3].label).toBe('Ready to bake')

    // Check timing
    expect(steps[0].time.getTime()).toBe(startTime.getTime())
    expect(steps[1].time.getTime()).toBe(startTime.getTime() + 30 * 60000) // +30 min
    expect(steps[2].time.getTime()).toBe(startTime.getTime() + 30 * 60000 + 2 * 3600000) // +30min + 2h
    expect(steps[3].time.getTime()).toBe(startTime.getTime() + 30 * 60000 + 3 * 3600000) // +30min + 3h total
  })

  it('includes sugar in description when enabled', () => {
    const inputs: TimelineInputs = {
      ...baseInputs,
      useAutolyse: true,
      includeSugar: true,
    }
    const steps = calculateTimeline(inputs, new Date(), mockTranslations)
    const endAutolyseStep = steps.find((s) => s.label === 'End autolyse')
    expect(endAutolyseStep?.description).toContain('sugar')
  })

  it('excludes sugar in description when disabled', () => {
    const inputs: TimelineInputs = {
      ...baseInputs,
      useAutolyse: true,
      includeSugar: false,
    }
    const steps = calculateTimeline(inputs, new Date(), mockTranslations)
    const endAutolyseStep = steps.find((s) => s.label === 'End autolyse')
    expect(endAutolyseStep?.description).not.toContain('sugar')
  })

  it('handles different autolyse durations', () => {
    const startTime = new Date('2024-01-01T10:00:00Z')
    
    const shortAutolyse = calculateTimeline(
      { ...baseInputs, useAutolyse: true, autolyseMinutes: 20 },
      startTime,
      mockTranslations
    )
    expect(shortAutolyse[1].time.getTime()).toBe(startTime.getTime() + 20 * 60000)

    const longAutolyse = calculateTimeline(
      { ...baseInputs, useAutolyse: true, autolyseMinutes: 60 },
      startTime,
      mockTranslations
    )
    expect(longAutolyse[1].time.getTime()).toBe(startTime.getTime() + 60 * 60000)
  })

  it('handles different bulk fermentation times', () => {
    const startTime = new Date('2024-01-01T10:00:00Z')
    
      const shortBulk = calculateTimeline(
        { ...baseInputs, bulkFermentHours: 1 },
        startTime,
        mockTranslations
      )
      expect(shortBulk[1].time.getTime()).toBe(startTime.getTime() + 1 * 3600000)

      const longBulk = calculateTimeline(
        { ...baseInputs, bulkFermentHours: 8 },
        startTime,
        mockTranslations
      )
    expect(longBulk[1].time.getTime()).toBe(startTime.getTime() + 8 * 3600000)
  })

  it('handles different final proof times', () => {
    const startTime = new Date('2024-01-01T10:00:00Z')
    
      const shortProof = calculateTimeline(
        { ...baseInputs, finalProofHours: 0.5 },
        startTime,
        mockTranslations
      )
      const totalTime = shortProof[shortProof.length - 1].time.getTime() - startTime.getTime()
      expect(totalTime).toBe(2.5 * 3600000) // 2h bulk + 0.5h proof

      const longProof = calculateTimeline(
        { ...baseInputs, finalProofHours: 24 },
        startTime,
        mockTranslations
      )
    const totalTimeLong = longProof[longProof.length - 1].time.getTime() - startTime.getTime()
    expect(totalTimeLong).toBe(26 * 3600000) // 2h bulk + 24h proof
  })

  it('includes correct pizza count in description', () => {
    const singlePizza = calculateTimeline({ ...baseInputs, pizzaCount: 1 }, new Date(), mockTranslations)
    const singleStep = singlePizza.find((s) => s.label === 'End bulk fermentation')
    expect(singleStep?.description).toContain('1 ball')

    const multiplePizza = calculateTimeline({ ...baseInputs, pizzaCount: 4 }, new Date(), mockTranslations)
    const multipleStep = multiplePizza.find((s) => s.label === 'End bulk fermentation')
    expect(multipleStep?.description).toContain('4 balls')
  })

  it('includes oven temp and bake time in final step', () => {
    const steps = calculateTimeline(
      {
        ...baseInputs,
        effectiveOvenTemp: 300,
        bakeMinutes: 8.5,
      },
      new Date(),
      mockTranslations
    )
    const finalStep = steps[steps.length - 1]
    expect(finalStep.description).toContain('300°C')
    expect(finalStep.description).toContain('9 minutes') // rounded up
  })

  describe('formatDuration', () => {
    it('formats minutes correctly', () => {
      const start = new Date('2024-01-01T10:00:00Z')
      const end = new Date('2024-01-01T10:30:00Z')
      expect(formatDuration(start, end)).toBe('+30 min')
    })

    it('formats hours correctly', () => {
      const start = new Date('2024-01-01T10:00:00Z')
      const end = new Date('2024-01-01T12:00:00Z')
      expect(formatDuration(start, end)).toBe('+2h')
    })

    it('formats hours and minutes correctly', () => {
      const start = new Date('2024-01-01T10:00:00Z')
      const end = new Date('2024-01-01T12:15:00Z')
      expect(formatDuration(start, end)).toBe('+2h 15min')
    })

    it('handles less than 60 minutes', () => {
      const start = new Date('2024-01-01T10:00:00Z')
      const end = new Date('2024-01-01T10:45:00Z')
      expect(formatDuration(start, end)).toBe('+45 min')
    })
  })

  describe('getTotalDuration', () => {
    it('calculates total duration correctly', () => {
      const startTime = new Date('2024-01-01T10:00:00Z')
      const steps = calculateTimeline(baseInputs, startTime, mockTranslations)
      const total = getTotalDuration(steps)
      
      // 2h bulk + 1h proof = 180 minutes
      expect(total).toBe(180)
    })

    it('calculates total duration with autolyse', () => {
      const startTime = new Date('2024-01-01T10:00:00Z')
      const steps = calculateTimeline(
        { ...baseInputs, useAutolyse: true, autolyseMinutes: 30 },
        startTime,
        mockTranslations
      )
      const total = getTotalDuration(steps)
      
      // 30min autolyse + 2h bulk + 1h proof = 210 minutes
      expect(total).toBe(210)
    })

    it('returns 0 for empty or single step', () => {
      expect(getTotalDuration([])).toBe(0)
      expect(getTotalDuration([{ time: new Date(), label: 'Test', description: 'Test' }])).toBe(0)
    })
  })
})

