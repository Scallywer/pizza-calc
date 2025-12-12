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
import { getTranslations, t, type Language } from './lib/translations'

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
  const [showReference, setShowReference] = usePersistentState<boolean>(
    'dough:show-reference',
    true,
  )
  const [language, setLanguage] = usePersistentState<Language>('dough:language', 'en')
  const translations = getTranslations(language)
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
        saltGrams: formatGrams(breakdown.salt),
        yeastGrams: formatGrams(breakdown.yeast),
        includeSugar,
        pizzaCount,
        effectiveOvenTemp,
        bakeMinutes,
      },
      startTime,
      {
        stepMix: translations.stepMix,
        stepAutolyse: translations.stepAutolyse,
        stepBulkFerment: translations.stepBulkFerment,
        stepDivide: translations.stepDivide,
        stepFinalProof: translations.stepFinalProof,
        stepBake: translations.stepBake,
        stepMixDesc: (params) => t(language, 'stepMixDesc', params),
        stepAutolyseDesc: translations.stepAutolyseDesc,
        stepBulkFermentDesc: (params) => t(language, 'stepBulkFermentDesc', params),
        stepDivideDesc: (params) => {
          const plural = params.count > 1 ? (language === 'hr' ? 'i' : 's') : (language === 'hr' ? 'u' : '')
          return t(language, 'stepDivideDesc', { ...params, plural })
        },
        stepFinalProofDesc: (params) => t(language, 'stepFinalProofDesc', params),
        stepBakeDesc: (params) => t(language, 'stepBakeDesc', params),
        sugar: translations.sugar,
        oil: translations.oil,
      }
    )
  }, [
    useAutolyse,
    autolyseMinutes,
    bulkFermentHours,
    finalProofHours,
    fermentTempC,
    breakdown.flour,
    breakdown.water,
    breakdown.salt,
    breakdown.yeast,
    includeSugar,
    pizzaCount,
    effectiveOvenTemp,
    bakeMinutes,
    timelineMode,
    timelineStartHours,
    language,
    translations,
  ])

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(language === 'hr' ? 'hr-HR' : 'en-US', {
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
          <p className="eyebrow">{translations.appTitle}</p>
          <h1>{translations.appSubtitle}</h1>
          <p className="lede">
            {translations.appDescription}
          </p>
        </div>
        <div className="hero-meta">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className={language === 'en' ? 'pill-option active' : 'pill-option'}
              onClick={() => setLanguage('en')}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              EN
            </button>
            <button
              type="button"
              className={language === 'hr' ? 'pill-option active' : 'pill-option'}
              onClick={() => setLanguage('hr')}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              HR
            </button>
          </div>
          <div className="pill">{translations.pillOffline}</div>
          <div className="pill accent">{translations.pillSettings}</div>
        </div>
      </header>

      <main className={`layout ${showReference ? 'show-reference' : ''}`}>
        {showReference && (
          <section className="panel">
            <div className="section-header">
              <div>
                <p className="label">{translations.labelReference}</p>
                <h2>{translations.referenceTitle}</h2>
                <p className="muted">{translations.referenceSubtitle}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {([
                { size: '26 cm', diameterCm: 26, isSquare: false as const },
                { size: '28 cm', diameterCm: 28, isSquare: false as const },
                { size: '30 cm', diameterCm: 30, isSquare: false as const },
                { size: '32 cm', diameterCm: 32, isSquare: false as const },
                { size: '35 cm', diameterCm: 35, isSquare: false as const },
                { size: '40 cm', diameterCm: 40, isSquare: false as const },
                { size: '30×40 cm', widthCm: 30, heightCm: 40, isSquare: true as const },
              ] as Array<
                | { size: string; diameterCm: number; isSquare: false }
                | { size: string; widthCm: number; heightCm: number; isSquare: true }
              >).map((item) => {
                const weights = DOUGH_PRESETS.slice(0, 6).map((p) => ({
                  style: p.name,
                  weight: formatGrams(
                    item.isSquare
                      ? estimateWeightFromSquare(item.widthCm, item.heightCm, p.thicknessFactor)
                      : estimateWeightFromDiameter(item.diameterCm, p.thicknessFactor)
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
        )}
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="label">{translations.labelPreset}</p>
              <h2>{preset.name}</h2>
              <p className="muted">{preset.description}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <button
                type="button"
                className={showReference ? 'pill-option active' : 'pill-option'}
                onClick={() => setShowReference(!showReference)}
                style={{ width: '140px', fontSize: '0.875rem' }}
              >
                {showReference ? translations.hideReference : translations.showReference}
              </button>
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
          </div>

          <div className="grid">
            <label className="field">
              <span className="label">{translations.labelMode}</span>
              <div className="pill-toggle">
                <button
                  type="button"
                  className={mode === 'weight' ? 'pill-option active' : 'pill-option'}
                  onClick={() => setMode('weight')}
                >
                  {translations.modeWeight}
                </button>
                <button
                  type="button"
                  className={mode === 'diameter' ? 'pill-option active' : 'pill-option'}
                  onClick={() => setMode('diameter')}
                >
                  {translations.modeDiameter}
                </button>
              </div>
            </label>

            {mode === 'weight' ? (
              <label className="field">
                <span className="label">{translations.labelTotalDoughWeight}</span>
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
                  <span className="label">{translations.labelPizzaCount}</span>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={pizzaCount}
                    onChange={(e) => setPizzaCount(Number(e.target.value) || 1)}
                  />
                </label>
                <label className="field">
                  <span className="label">{translations.labelPizzaDiameter}</span>
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
              <span className="label">{translations.labelHydration}</span>
              <input
                className="input"
                type="number"
                min={55}
                max={90}
                value={hydration}
                onChange={(e) => setHydration(Math.max(Number(e.target.value) || 0, 0))}
              />
              <small className="muted">{t(language, 'helpPresetDefault', { percent: preset.defaultHydration.toString() })}</small>
            </label>

            <label className="field">
              <span className="label">{translations.labelYeastType}</span>
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
                {t(language, 'helpBaseYeast', { percent: preset.yeastPercent.toString() })}
              </small>
            </label>

            <label className="field">
              <span className="label">{translations.labelUseAutolyse}</span>
              <button
                type="button"
                className={useAutolyse ? 'pill-option active' : 'pill-option'}
                onClick={() => setUseAutolyse(!useAutolyse)}
                style={{ width: '100%' }}
              >
                {translations.labelAutolyse}
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
                        {mins} {translations.minutes}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <small className="muted">{translations.helpAutolyse}</small>
            </label>

            <label className="field">
              <span className="label">{translations.labelBulkFerment}</span>
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
              <small className="muted">{translations.helpBulkFerment}</small>
            </label>

            <label className="field">
              <span className="label">{translations.labelTargetRiseTime}</span>
              <select
                className="input"
                value={finalProofHours}
                onChange={(e) => setFinalProofHours(Number(e.target.value))}
              >
                {[1, 2, 4, 8, 16, 24].map((hours) => (
                  <option key={hours} value={hours}>
                    {hours}h
                  </option>
                ))}
              </select>
              <small className="muted">{translations.helpRiseTime}</small>
            </label>

            <label className="field">
              <span className="label">{translations.labelFermentTemp}</span>
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
            </label>

            <label className="field">
              <span className="label">{translations.labelMaxOvenTemp}</span>
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
            </label>

            <label className="field">
              <span className="label">{translations.labelIncludeSugar}</span>
              <button
                type="button"
                className={includeSugar ? 'pill-option active' : 'pill-option'}
                onClick={() => setIncludeSugar(!includeSugar)}
                style={{ width: '100%' }}
              >
                {translations.sugar}
              </button>
              <small className="muted">
                {t(language, 'helpSugar', { percent: preset.sugarPercent.toString() })}
              </small>
            </label>
          </div>
        </section>

        <section className="panel results">
          <div className="section-header">
            <div>
              <p className="label">{translations.labelResults}</p>
              <h2>{translations.labelIngredients}</h2>
              <p className="muted">
                {translations.resultsDescription}
              </p>
            </div>
            <div className="stat">
              <span className="label">{translations.totalDough}</span>
              <strong>{formatGrams(totalWeight)} g</strong>
              <span className="muted">
                {formatGrams(breakdown.perBall)} g {translations.perBall}
              </span>
            </div>
          </div>

          <div className="metrics">
            <div className="metric">
              <span className="label">{translations.labelHydration}</span>
              <strong>{hydration}%</strong>
            </div>
            <div className="metric">
              <span className="label">{translations.labelOvenTemp}</span>
              <strong>
                {effectiveOvenTemp} °C{' '}
                {effectiveOvenTemp < preset.ovenTempC ? translations.labelCapped : ''}
              </strong>
            </div>
            <div className="metric">
              <span className="label">{translations.bakeTime}</span>
              <strong>{Math.ceil(bakeMinutes)} {translations.minutes}</strong>
            </div>
          </div>

          <div className="table">
            <div className="table-row header">
              <span>{translations.labelIngredients}</span>
              <span>{translations.labelGrams}</span>
            </div>
            {[
              [translations.flour, breakdown.flour],
              [translations.water, breakdown.water],
              [translations.salt, breakdown.salt],
              [translations.oil, breakdown.oil],
              ...(includeSugar && breakdown.sugar > 0
                ? [[translations.sugar, breakdown.sugar]]
                : []),
              [translations.yeast, breakdown.yeast],
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
              <p className="label">{translations.labelTimeline}</p>
              <h2>{translations.timelineTitle}</h2>
              <p className="muted">
                {timelineMode === 'time' 
                  ? `${timelineStartHours === 0 ? translations.timelineStartNow : t(language, 'timelineStartIn', { hours: timelineStartHours.toString() })} ${translations.timelineToHaveReady} ${formatTime(timeline[timeline.length - 1]?.time)}`
                  : `${translations.timelineTotalTime} ${formatDuration(timeline[0]?.time, timeline[timeline.length - 1]?.time)}`
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
                  <option value={0}>{translations.timelineStartNow}</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                    <option key={hours} value={hours}>
                      {t(language, 'timelineStartIn', { hours: hours.toString() })}
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
                  {translations.timelineModeTime}
                </button>
                <button
                  type="button"
                  className={timelineMode === 'duration' ? 'pill-option active' : 'pill-option'}
                  onClick={() => setTimelineMode('duration')}
                >
                  {translations.timelineModeDuration}
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
                    ? translations.now
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
      </main>
    </div>
  )
}

export default App
