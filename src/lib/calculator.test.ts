import { describe, expect, it } from 'vitest'
import {
  computeDough,
  deriveTotalWeight,
  DoughInputs,
  estimateWeightFromDiameter,
  formatGrams,
  estimateBakeMinutes,
  suggestYeastPercent,
} from './calculator'

const baseInputs: DoughInputs = {
  mode: 'weight',
  pizzaCount: 2,
  targetWeight: 1000,
  diameterCm: 30,
  hydrationPercent: 65,
  saltPercent: 2.5,
  oilPercent: 3,
  sugarPercent: 1,
  yeastPercent: 0.35,
  yeastType: 'instant',
  thicknessFactor: 0.36,
}

describe('calculator', () => {
  it('computes ingredient weights from total dough', () => {
    const result = computeDough(baseInputs)
    expect(formatGrams(result.totalDough)).toBe(1000)
    expect(result.flour).toBeGreaterThan(570)
    expect(result.flour).toBeLessThan(590)
    expect(result.water).toBeCloseTo(result.flour * 0.65, 4)
    expect(result.perBall).toBeCloseTo(500, 1)
  })

  it('derives total weight from diameter mode', () => {
    const total = deriveTotalWeight({ ...baseInputs, mode: 'diameter', pizzaCount: 2 })
    expect(total).toBeGreaterThan(450)
    expect(total).toBeLessThan(520)
  })

  it('estimates weight from diameter and thickness', () => {
    const weight = estimateWeightFromDiameter(30, 0.36)
    expect(weight).toBeCloseTo(254, 0)
  })

  it('estimates bake minutes with reasonable bounds', () => {
    expect(estimateBakeMinutes(450, 0.33)).toBeLessThan(8)
    expect(estimateBakeMinutes(230, 0.45)).toBeGreaterThan(7)
  })

  it('suggests yeast percent based on time and temp', () => {
    const base = 0.35
    const coolSlow = suggestYeastPercent({ basePercent: base, targetHours: 48, tempC: 18 })
    const warmFast = suggestYeastPercent({ basePercent: base, targetHours: 8, tempC: 26 })
    expect(coolSlow).toBeGreaterThan(base * 0.3)
    expect(warmFast).toBeLessThan(base * 3.5)
    expect(warmFast).toBeGreaterThan(base * 0.5)
  })

  it('matches TheCalcs baker percentages example', () => {
    const total = 1000
    const hydration = 65
    const salt = 2
    const yeast = 0.5
    const inputs: DoughInputs = {
      mode: 'weight',
      pizzaCount: 4,
      targetWeight: total,
      diameterCm: 30,
      hydrationPercent: hydration,
      saltPercent: salt,
      oilPercent: 0,
      sugarPercent: 0,
      yeastPercent: yeast,
      yeastType: 'instant',
      thicknessFactor: 0.36,
    }
    const result = computeDough(inputs)
    // formatGrams now rounds up, so adjust expectations
    expect(formatGrams(result.flour)).toBeGreaterThanOrEqual(597)
    expect(formatGrams(result.flour)).toBeLessThan(600)
    expect(formatGrams(result.water)).toBeGreaterThanOrEqual(388)
    expect(formatGrams(result.water)).toBeLessThan(390)
    expect(formatGrams(result.salt)).toBeGreaterThanOrEqual(11)
    expect(formatGrams(result.salt)).toBeLessThan(13)
    expect(formatGrams(result.yeast)).toBeGreaterThanOrEqual(2)
    expect(formatGrams(result.yeast)).toBeLessThan(4)
    expect(formatGrams(result.totalDough)).toBeGreaterThanOrEqual(total - 1)
    expect(formatGrams(result.totalDough)).toBeLessThan(total + 3)
  })

  it('matches Lumo NY 14in example totals', () => {
    const inputs: DoughInputs = {
      mode: 'diameter',
      pizzaCount: 2,
      targetWeight: 0,
      diameterCm: 35.56,
      hydrationPercent: 63,
      saltPercent: 2.5,
      oilPercent: 2,
      sugarPercent: 0,
      yeastPercent: 0.3,
      yeastType: 'instant',
      thicknessFactor: 0.34, // tuned toward Lumo NY example output
    }
    const result = computeDough(inputs)
    expect(result.flour).toBeCloseTo(402.5, 0)
    expect(result.water).toBeCloseTo(253.5, 0)
    expect(result.salt).toBeCloseTo(10, 0)
    expect(result.oil).toBeCloseTo(8, 0)
    expect(result.yeast).toBeCloseTo(1.2, 1)
    expect(result.totalDough).toBeCloseTo(675.3, 0)
  })

  it('matches Cosmic Pie Neapolitan long RT example', () => {
    const inputs: DoughInputs = {
      mode: 'weight',
      pizzaCount: 2,
      targetWeight: 815,
      diameterCm: 30,
      hydrationPercent: 60,
      saltPercent: 2.8,
      oilPercent: 0,
      sugarPercent: 0,
      yeastPercent: 0.1,
      yeastType: 'instant',
      thicknessFactor: 0.33,
    }
    const result = computeDough(inputs)
    expect(result.flour).toBeCloseTo(500, -1)
    expect(result.water).toBeCloseTo(300, -1)
    expect(result.salt).toBeCloseTo(14, 0)
    expect(result.yeast).toBeCloseTo(0.5, 1)
  })

  it('keeps yeast suggestion sane for short warm rise (ClassicFork)', () => {
    const base = 0.5
    const suggested = suggestYeastPercent({ basePercent: base, targetHours: 1, tempC: 24 })
    expect(suggested).toBeGreaterThanOrEqual(0.4)
    expect(suggested).toBeLessThanOrEqual(5)
  })

  it('raises yeast materially when target time is very short', () => {
    const base = 0.3
    const fourHour = suggestYeastPercent({ basePercent: base, targetHours: 4, tempC: 20 })
    const oneHour = suggestYeastPercent({ basePercent: base, targetHours: 1, tempC: 20 })
    expect(oneHour).toBeGreaterThan(fourHour * 1.5)
  })

  it('aligns with common room-temp yeast charts around 21°C', () => {
    const base = 0.5
    const sixHour = suggestYeastPercent({ basePercent: base, targetHours: 6.4, tempC: 21 })
    const fourHour = suggestYeastPercent({ basePercent: base, targetHours: 4, tempC: 21 })
    const twoHour = suggestYeastPercent({ basePercent: base, targetHours: 2, tempC: 21 })
    expect(sixHour).toBeCloseTo(0.55, 1)
    expect(fourHour).toBeCloseTo(0.9, 1)
    expect(twoHour).toBeCloseTo(1.9, 1)
  })

  it('increases yeast noticeably when colder', () => {
    const base = 0.3
    const twenty = suggestYeastPercent({ basePercent: base, targetHours: 6, tempC: 20 })
    const ten = suggestYeastPercent({ basePercent: base, targetHours: 6, tempC: 10 })
    expect(ten).toBeGreaterThan(twenty * 1.5)
  })
})

