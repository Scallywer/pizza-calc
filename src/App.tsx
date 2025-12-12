import { useEffect, useMemo } from 'react'
import './App.css'
import { DOUGH_PRESETS, yeastOptions } from './data/presets'
import {
  computeDough,
  deriveTotalWeight,
  formatGrams,
  suggestYeastPercent,
  estimateBakeMinutes,
} from './lib/calculator'
import type { DoughMode } from './lib/calculator'
import { usePersistentState } from './lib/storage'

const defaultPreset = DOUGH_PRESETS[0]

function App() {
  const [presetId, setPresetId] = usePersistentState(
    'dough:preset',
    defaultPreset.id,
  )
  const [mode, setMode] = usePersistentState<DoughMode>('dough:mode', 'weight')
  const [pizzaCount, setPizzaCount] = usePersistentState<number>(
    'dough:pizza-count',
    1,
  )
  const [targetWeight, setTargetWeight] = usePersistentState<number>(
    'dough:target-weight:v2',
    300,
  )
  const [diameterCm, setDiameterCm] = usePersistentState<number>(
    'dough:diameter',
    defaultPreset.defaultDiameterCm,
  )
  const [hydration, setHydration] = usePersistentState<number>(
    'dough:hydration',
    defaultPreset.defaultHydration,
  )
  const [yeastType, setYeastType] = usePersistentState(
    'dough:yeast',
    'active-dry',
  )
  const [maxOvenTempC, setMaxOvenTempC] = usePersistentState<number>(
    'dough:max-oven-temp',
    300,
  )
  const [fermentTempC, setFermentTempC] = usePersistentState<number>(
    'dough:ferment-temp',
    20,
  )
  const [targetHours, setTargetHours] = usePersistentState<number>(
    'dough:target-hours',
    1,
  )

  const preset = useMemo(
    () => DOUGH_PRESETS.find((p) => p.id === presetId) ?? defaultPreset,
    [presetId],
  )
  useEffect(() => {
    setHydration(preset.defaultHydration)
    setDiameterCm(preset.defaultDiameterCm)
    setYeastType(preset.defaultYeastType)
  }, [
    preset.defaultDiameterCm,
    preset.defaultHydration,
    preset.yeastPercent,
    preset.defaultYeastType,
    preset.ovenTempC,
    setDiameterCm,
    setHydration,
    setYeastType,
  ])

  const suggestedYeast = useMemo(
    () =>
      suggestYeastPercent({
        basePercent: preset.yeastPercent,
        targetHours,
        tempC: fermentTempC,
      }),
    [fermentTempC, preset.yeastPercent, targetHours],
  )

  const inputs = useMemo(
    () => ({
      mode,
      pizzaCount,
      targetWeight,
      diameterCm,
      hydrationPercent: hydration,
      saltPercent: preset.saltPercent,
      oilPercent: preset.oilPercent,
      sugarPercent: preset.sugarPercent,
      yeastPercent: suggestedYeast,
      yeastType,
      thicknessFactor: preset.thicknessFactor,
    }),
    [
      mode,
      pizzaCount,
      targetWeight,
      diameterCm,
      hydration,
      preset.saltPercent,
      preset.oilPercent,
      preset.sugarPercent,
      preset.thicknessFactor,
      suggestedYeast,
      yeastType,
    ],
  )

  const breakdown = useMemo(() => computeDough(inputs), [inputs])
  const totalWeight = deriveTotalWeight(inputs)
  const effectiveOvenTemp = useMemo(
    () => Math.min(preset.ovenTempC, maxOvenTempC),
    [maxOvenTempC, preset.ovenTempC],
  )
  const bakeMinutes = estimateBakeMinutes(effectiveOvenTemp, preset.thicknessFactor)

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Pizza & Bread Dough Calculator</p>
          <h1>Make-anywhere dough with smart presets</h1>
          <p className="lede">
            Start from a classic style, tune hydration, choose yeast and oven,
            and size by total dough weight or pizza diameter.
          </p>
        </div>
        <div className="hero-meta">
          <div className="pill">React + Vite • Offline friendly</div>
          <div className="pill accent">Settings saved locally</div>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="label">Preset</p>
              <h2>{preset.name}</h2>
              <p className="muted">{preset.description}</p>
            </div>
            <select
              className="input"
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
            >
              {DOUGH_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid">
            <label className="field">
              <span className="label">Mode</span>
              <div className="pill-toggle">
                <button
                  type="button"
                  className={mode === 'weight' ? 'pill-option active' : 'pill-option'}
                  onClick={() => setMode('weight')}
                >
                  Total dough (g)
                </button>
                <button
                  type="button"
                  className={mode === 'diameter' ? 'pill-option active' : 'pill-option'}
                  onClick={() => setMode('diameter')}
                >
                  Pizza diameter
                </button>
              </div>
            </label>

            {mode === 'weight' ? (
              <label className="field">
                <span className="label">Total dough weight (g)</span>
                <input
                  className="input"
                  type="number"
                  min={100}
                  value={targetWeight}
                  onChange={(e) =>
                    setTargetWeight(Math.max(Number(e.target.value) || 0, 0))
                  }
                />
              </label>
            ) : (
              <>
                <label className="field">
                  <span className="label">Number of pizzas</span>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={pizzaCount}
                    onChange={(e) => setPizzaCount(Number(e.target.value) || 1)}
                  />
                </label>
                <label className="field">
                  <span className="label">Pizza diameter (cm)</span>
                  <input
                    className="input"
                    type="number"
                    min={15}
                    value={diameterCm}
                    onChange={(e) =>
                      setDiameterCm(Math.max(Number(e.target.value) || 0, 0))
                    }
                  />
                </label>
              </>
            )}

            <label className="field">
              <span className="label">Hydration (%)</span>
              <input
                className="input"
                type="number"
                min={55}
                max={90}
                value={hydration}
                onChange={(e) => setHydration(Math.max(Number(e.target.value) || 0, 0))}
              />
              <small className="muted">Preset default: {preset.defaultHydration}%</small>
            </label>

            <label className="field">
              <span className="label">Yeast type</span>
              <select
                className="input"
                value={yeastType}
                onChange={(e) => setYeastType(e.target.value)}
              >
                {yeastOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <small className="muted">
                Base yeast: {preset.yeastPercent}% of flour (adjusted by type)
              </small>
            </label>

            <label className="field">
              <span className="label">Target rise time (hours)</span>
              <select
                className="input"
                value={targetHours}
                onChange={(e) => setTargetHours(Number(e.target.value))}
              >
                {[1, 2, 4, 8, 16, 24].map((hours) => (
                  <option key={hours} value={hours}>
                    {hours}h
                  </option>
                ))}
              </select>
              <small className="muted">
                Shorter time → more yeast. Presets vary by style.
              </small>
            </label>

            <label className="field">
              <span className="label">Fermentation temp (°C)</span>
              <select
                className="input"
                value={fermentTempC}
                onChange={(e) => setFermentTempC(Number(e.target.value))}
              >
                {[5, 10, 15, 20, 25, 30, 35, 40].map((temp) => (
                  <option key={temp} value={temp}>
                    {temp} °C
                  </option>
                ))}
              </select>
              <small className="muted">
                Colder (fridge) needs more yeast; warmer needs less.
              </small>
            </label>


            <label className="field">
              <span className="label">My oven max (°C)</span>
              <select
                className="input"
                value={maxOvenTempC}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  setMaxOvenTempC(next)
                }}
              >
                {[300, 250, 200].map((temp) => (
                  <option key={temp} value={temp}>
                    {temp} °C
                  </option>
                ))}
              </select>
              <small className="muted">
                Actual bake temp = min(preset {preset.ovenTempC} °C, max {maxOvenTempC} °C)
              </small>
            </label>
          </div>
        </section>

        <section className="panel results">
          <div className="section-header">
            <div>
              <p className="label">Results</p>
              <h2>Ingredient breakdown</h2>
              <p className="muted">
                Adjust hydration, yeast type, and sizing to see updated weights.
              </p>
            </div>
            <div className="stat">
              <span className="label">Total dough</span>
              <strong>{formatGrams(totalWeight)} g</strong>
              <span className="muted">
                {formatGrams(breakdown.perBall)} g per pizza
              </span>
            </div>
          </div>

          <div className="metrics">
            <div className="metric">
              <span className="label">Hydration</span>
              <strong>{hydration}%</strong>
            </div>
            <div className="metric">
              <span className="label">Oven temp</span>
              <strong>
                {effectiveOvenTemp} °C{' '}
                {effectiveOvenTemp < preset.ovenTempC ? '(capped)' : ''}
              </strong>
            </div>
            <div className="metric">
              <span className="label">Bake time (est)</span>
              <strong>{Math.ceil(bakeMinutes)} min</strong>
            </div>
          </div>

          <div className="table">
            <div className="table-row header">
              <span>Ingredient</span>
              <span>Grams</span>
            </div>
            {[
              ['Flour', breakdown.flour],
              ['Water', breakdown.water],
              ['Salt', breakdown.salt],
              ['Oil', breakdown.oil],
              ['Sugar', breakdown.sugar],
              ['Yeast', breakdown.yeast],
            ].map(([name, value]) => (
              <div key={name} className="table-row">
                <span>{name}</span>
                <span>{formatGrams(value as number)} g</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
