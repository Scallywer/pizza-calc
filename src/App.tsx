import { useEffect, useMemo } from 'react'
import './App.css'
import { DOUGH_PRESETS, yeastOptions } from './data/presets'
import {
  computeDough,
  deriveTotalWeight,
  formatGrams,
  suggestYeastPercent,
  estimateBakeMinutes,
  estimateWeightFromDiameter,
  estimateWeightFromSquare,
} from './lib/calculator'
import type { DoughMode, DoughInputs, YeastType } from './lib/calculator'
import { calculateTimeline, formatDuration as formatDurationUtil } from './lib/timeline'
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
  const [yeastType, setYeastType] = usePersistentState<YeastType>(
    'dough:yeast',
    'active-dry',
  )
  const [maxOvenTempC, setMaxOvenTempC] = usePersistentState<number>(
    'dough:max-oven-temp',
    300,
  )
  const [includeSugar, setIncludeSugar] = usePersistentState<boolean>(
    'dough:include-sugar',
    true,
  )
  const [timelineMode, setTimelineMode] = usePersistentState<'time' | 'duration'>(
    'dough:timeline-mode',
    'time',
  )
  const [timelineStartHours, setTimelineStartHours] = usePersistentState<number>(
    'dough:timeline-start-hours',
    0,
  )
  const [fermentTempC, setFermentTempC] = usePersistentState<number>(
    'dough:ferment-temp',
    20,
  )
  const [useAutolyse, setUseAutolyse] = usePersistentState<boolean>(
    'dough:use-autolyse',
    false,
  )
  const [autolyseMinutes, setAutolyseMinutes] = usePersistentState<number>(
    'dough:autolyse-minutes',
    30,
  )
  const [bulkFermentHours, setBulkFermentHours] = usePersistentState<number>(
    'dough:bulk-ferment-hours',
    2,
  )
  const [finalProofHours, setFinalProofHours] = usePersistentState<number>(
    'dough:final-proof-hours',
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
        targetHours: bulkFermentHours + finalProofHours,
        tempC: fermentTempC,
      }),
    [fermentTempC, preset.yeastPercent, bulkFermentHours, finalProofHours],
  )

  const inputs = useMemo<DoughInputs>(
    () => ({
      mode,
      pizzaCount,
      targetWeight,
      diameterCm,
      hydrationPercent: hydration,
      saltPercent: preset.saltPercent,
      oilPercent: preset.oilPercent,
      sugarPercent: includeSugar ? preset.sugarPercent : 0,
      yeastPercent: suggestedYeast,
      yeastType: yeastType as YeastType,
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
      includeSugar,
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

  // Calculate timeline
  const timeline = useMemo(() => {
    const startTime = new Date()
    if (timelineMode === 'time' && timelineStartHours > 0) {
      startTime.setHours(startTime.getHours() + timelineStartHours)
    }
    return calculateTimeline(
      {
        useAutolyse,
        autolyseMinutes,
        bulkFermentHours,
        finalProofHours,
        fermentTempC,
        flourGrams: formatGrams(breakdown.flour),
        waterGrams: formatGrams(breakdown.water),
        includeSugar,
        pizzaCount,
        effectiveOvenTemp,
        bakeMinutes,
      },
      startTime
    )
  }, [
    useAutolyse,
    autolyseMinutes,
    bulkFermentHours,
    finalProofHours,
    fermentTempC,
    breakdown.flour,
    breakdown.water,
    includeSugar,
    pizzaCount,
    effectiveOvenTemp,
    bakeMinutes,
    timelineMode,
    timelineStartHours,
  ])

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDuration = formatDurationUtil

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
                onChange={(e) => setYeastType(e.target.value as YeastType)}
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
              <span className="label">Use autolyse</span>
              <button
                type="button"
                className={useAutolyse ? 'pill-option active' : 'pill-option'}
                onClick={() => setUseAutolyse(!useAutolyse)}
                style={{ width: '100%' }}
              >
                Autolyse
              </button>
              {useAutolyse && (
                <>
                  <select
                    className="input"
                    value={autolyseMinutes}
                    onChange={(e) => setAutolyseMinutes(Number(e.target.value))}
                    style={{ marginTop: '0.5rem' }}
                  >
                    {[20, 30, 45, 60].map((mins) => (
                      <option key={mins} value={mins}>
                        {mins} minutes
                      </option>
                    ))}
                  </select>
                </>
              )}
              <small className="muted">
                Rest flour + water before adding salt/yeast for better gluten development
              </small>
            </label>

            <label className="field">
              <span className="label">Bulk fermentation (hours)</span>
              <select
                className="input"
                value={bulkFermentHours}
                onChange={(e) => setBulkFermentHours(Number(e.target.value))}
              >
                {[0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24].map((hours) => (
                  <option key={hours} value={hours}>
                    {hours}h
                  </option>
                ))}
              </select>
              <small className="muted">
                First rise after mixing, before dividing into balls
              </small>
            </label>

            <label className="field">
              <span className="label">Final proof (hours)</span>
              <select
                className="input"
                value={finalProofHours}
                onChange={(e) => setFinalProofHours(Number(e.target.value))}
              >
                {[0.5, 1, 2, 3, 4, 6, 8, 12, 24].map((hours) => (
                  <option key={hours} value={hours}>
                    {hours}h
                  </option>
                ))}
              </select>
              <small className="muted">
                Final rise after shaping, before baking
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

            <label className="field">
              <span className="label">Include sugar</span>
              <button
                type="button"
                className={includeSugar ? 'pill-option active' : 'pill-option'}
                onClick={() => setIncludeSugar(!includeSugar)}
                style={{ width: '100%' }}
              >
                Sugar
              </button>
              <small className="muted">
                Sugar helps with browning and fermentation. Preset: {preset.sugarPercent}%
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
              ...(includeSugar && breakdown.sugar > 0
                ? [['Sugar', breakdown.sugar]]
                : []),
              ['Yeast', breakdown.yeast],
            ].map(([name, value]) => (
              <div key={name} className="table-row">
                <span>{name}</span>
                <span>{formatGrams(value as number)} g</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <p className="label">Timeline</p>
              <h2>Step-by-step schedule</h2>
              <p className="muted">
                {timelineMode === 'time' 
                  ? `Start ${timelineStartHours === 0 ? 'now' : `in ${timelineStartHours}h`} to have pizza ready at ${formatTime(timeline[timeline.length - 1]?.time)}`
                  : `Total time: ${formatDuration(timeline[0]?.time, timeline[timeline.length - 1]?.time)}`
                }
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              {timelineMode === 'time' && (
                <select
                  className="input"
                  value={timelineStartHours}
                  onChange={(e) => setTimelineStartHours(Number(e.target.value))}
                  style={{ width: '140px', fontSize: '0.875rem' }}
                >
                  <option value={0}>Start now</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                    <option key={hours} value={hours}>
                      In {hours}h
                    </option>
                  ))}
                </select>
              )}
              <div className="pill-toggle">
                <button
                  type="button"
                  className={timelineMode === 'time' ? 'pill-option active' : 'pill-option'}
                  onClick={() => setTimelineMode('time')}
                >
                  Time
                </button>
                <button
                  type="button"
                  className={timelineMode === 'duration' ? 'pill-option active' : 'pill-option'}
                  onClick={() => setTimelineMode('duration')}
                >
                  Duration
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {timeline.map((step, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#0b1426',
                  border: '1px solid #243040',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    minWidth: timelineMode === 'duration' ? '100px' : '80px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#f8fafc',
                  }}
                >
                  {timelineMode === 'time'
                    ? formatTime(step.time)
                    : index === 0
                    ? 'Now'
                    : formatDuration(timeline[0].time, step.time)
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: '#f8fafc' }}>
                    {step.label}
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <p className="label">Reference</p>
              <h2>Dough Ball Weight Guide</h2>
              <p className="muted">Recommended weights by pizza size/style</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { size: '26 cm', diameterCm: 26, isSquare: false },
              { size: '28 cm', diameterCm: 28, isSquare: false },
              { size: '30 cm', diameterCm: 30, isSquare: false },
              { size: '32 cm', diameterCm: 32, isSquare: false },
              { size: '35 cm', diameterCm: 35, isSquare: false },
              { size: '40 cm', diameterCm: 40, isSquare: false },
              { size: '30×40 cm', widthCm: 30, heightCm: 40, isSquare: true },
            ].map((item) => {
              const weights = DOUGH_PRESETS.slice(0, 6).map((p) => ({
                style: p.name,
                weight: formatGrams(
                  item.isSquare
                    ? estimateWeightFromSquare(item.widthCm!, item.heightCm!, p.thicknessFactor)
                    : estimateWeightFromDiameter(item.diameterCm!, p.thicknessFactor)
                ),
              }))
              const minWeight = Math.min(...weights.map((w) => w.weight))
              const maxWeight = Math.max(...weights.map((w) => w.weight))

              return (
                <div
                  key={item.size}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#0b1426',
                    border: '1px solid #243040',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#f8fafc' }}>{item.size}</div>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      {minWeight}–{maxWeight}g
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '6px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {weights.map(({ style, weight }) => (
                      <div
                        key={style}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: '#0f172a',
                          border: '1px solid #1e293b',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ color: '#cbd5e1', fontSize: '0.75rem', marginBottom: '2px' }}>
                          {style}
                        </div>
                        <div style={{ color: '#60a5fa', fontWeight: '600' }}>{weight}g</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
