export type Language = 'en' | 'hr'

export interface Translations {
  // Header
  appTitle: string
  appSubtitle: string
  pillOffline: string
  pillSettings: string

  // Preset section
  labelPreset: string
  labelSelectPreset: string
  showReference: string
  hideReference: string

  // Input fields
  labelMode: string
  modeWeight: string
  modeDiameter: string
  labelTotalDoughWeight: string
  labelPizzaCount: string
  labelPizzaDiameter: string
  labelHydration: string
  labelSalt: string
  labelOil: string
  labelSugar: string
  labelMaxOvenTemp: string
  labelFermentTemp: string
  labelTargetRiseTime: string
  labelBulkFerment: string
  labelAutolyse: string
  labelAutolyseMinutes: string
  labelUseAutolyse: string
  labelIncludeSugar: string
  helpRiseTime: string
  helpAutolyse: string
  helpSugar: string

  // Results section
  labelResults: string
  labelIngredients: string
  flour: string
  water: string
  salt: string
  oil: string
  sugar: string
  yeast: string
  totalDough: string
  perBall: string
  bakeTime: string
  minutes: string

  // Timeline section
  labelTimeline: string
  timelineTitle: string
  timelineStartNow: string
  timelineStartIn: string
  timelineToHaveReady: string
  timelineTotalTime: string
  timelineModeTime: string
  timelineModeDuration: string
  stepMix: string
  stepAutolyse: string
  stepBulkFerment: string
  stepDivide: string
  stepFinalProof: string
  stepBake: string
  stepMixDesc: string
  stepAutolyseDesc: string
  stepBulkFermentDesc: string
  stepDivideDesc: string
  stepFinalProofDesc: string
  stepBakeDesc: string

  // Reference section
  labelReference: string
  referenceTitle: string
  referenceSubtitle: string

  // Additional strings
  appDescription: string
  labelYeastType: string
  helpPresetDefault: string
  helpBaseYeast: string
  helpBulkFerment: string
  resultsDescription: string
  labelOvenTemp: string
  labelCapped: string
  labelGrams: string
  now: string
}

const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'Pizza & Bread Dough Calculator',
    appSubtitle: 'Make-anywhere dough with smart presets',
    pillOffline: 'React + Vite • Offline friendly',
    pillSettings: 'Settings saved locally',
    labelPreset: 'Preset',
    labelSelectPreset: 'Select preset',
    showReference: 'Show Reference',
    hideReference: 'Hide Reference',
    labelMode: 'Mode',
    modeWeight: 'Total dough weight',
    modeDiameter: 'Pizza diameter',
    labelTotalDoughWeight: 'Total dough weight (g)',
    labelPizzaCount: 'Number of pizzas',
    labelPizzaDiameter: 'Pizza diameter (cm)',
    labelHydration: 'Hydration (%)',
    labelSalt: 'Salt (%)',
    labelOil: 'Oil (%)',
    labelSugar: 'Sugar (%)',
    labelMaxOvenTemp: 'Max oven temp (°C)',
    labelFermentTemp: 'Fermentation temp (°C)',
    labelTargetRiseTime: 'Target rise time (hours)',
    labelBulkFerment: 'Bulk fermentation (hours)',
    labelAutolyse: 'Autolyse',
    labelAutolyseMinutes: 'Autolyse (minutes)',
    labelUseAutolyse: 'Use autolyse',
    labelIncludeSugar: 'Include sugar',
    helpRiseTime: 'Presets vary by style',
    helpAutolyse: 'Rest flour + water before adding salt/yeast for better gluten development',
    helpSugar: 'Sugar helps with browning and fermentation. Preset: {percent}%',
    labelResults: 'Results',
    labelIngredients: 'Ingredients',
    flour: 'Flour',
    water: 'Water',
    salt: 'Salt',
    oil: 'Oil',
    sugar: 'Sugar',
    yeast: 'Yeast',
    totalDough: 'Total dough',
    perBall: 'Per ball',
    bakeTime: 'Bake time',
    minutes: 'minutes',
    labelTimeline: 'Timeline',
    timelineTitle: 'Step-by-step schedule',
    timelineStartNow: 'Start now',
    timelineStartIn: 'Start in {hours}h',
    timelineToHaveReady: 'to have pizza ready at',
    timelineTotalTime: 'Total time:',
    timelineModeTime: 'Time',
    timelineModeDuration: 'Duration',
    stepMix: 'Mix ingredients',
    stepAutolyse: 'Autolyse rest',
    stepBulkFerment: 'Bulk fermentation',
    stepDivide: 'Divide & shape',
    stepFinalProof: 'Final proof',
    stepBake: 'Bake',
    stepMixDesc: 'Combine {flour}g flour, {water}g water, {salt}g salt, {yeast}g yeast{additions}',
    stepAutolyseDesc: 'Rest flour and water only',
    stepBulkFermentDesc: 'First rise at {temp}°C',
    stepDivideDesc: 'Divide into {count} ball{plural}',
    stepFinalProofDesc: 'Second rise at {temp}°C',
    stepBakeDesc: 'Bake at {temp}°C for {minutes} minutes',
    labelReference: 'Reference',
    referenceTitle: 'Dough Ball Weight Guide',
    referenceSubtitle: 'Recommended weights by pizza size/style',
    appDescription: 'Start from a classic style, tune hydration, choose yeast and oven, and size by total dough weight or pizza diameter.',
    labelYeastType: 'Yeast type',
    helpPresetDefault: 'Preset default: {percent}%',
    helpBaseYeast: 'Base yeast: {percent}% of flour (adjusted by type)',
    helpBulkFerment: 'First rise after mixing, before dividing into balls',
    resultsDescription: 'Adjust hydration, yeast type, and sizing to see updated weights.',
    labelOvenTemp: 'Oven temp',
    labelCapped: '(capped)',
    labelGrams: 'Grams',
    now: 'Now',
  },
  hr: {
    appTitle: 'Kalkulator tijesta za pizzu i kruh',
    appSubtitle: 'Tijesto za bilo gdje s pametnim predpostavkama',
    pillOffline: 'React + Vite • Radi offline',
    pillSettings: 'Postavke spremljene lokalno',
    labelPreset: 'Predpostavka',
    labelSelectPreset: 'Odaberi predpostavku',
    showReference: 'Prikaži referencu',
    hideReference: 'Sakrij referencu',
    labelMode: 'Način',
    modeWeight: 'Ukupna težina tijesta',
    modeDiameter: 'Promjer pizze',
    labelTotalDoughWeight: 'Ukupna težina tijesta (g)',
    labelPizzaCount: 'Broj pizza',
    labelPizzaDiameter: 'Promjer pizze (cm)',
    labelHydration: 'Hidracija (%)',
    labelSalt: 'Sol (%)',
    labelOil: 'Ulje (%)',
    labelSugar: 'Šećer (%)',
    labelMaxOvenTemp: 'Maks. temperatura pećnice (°C)',
    labelFermentTemp: 'Temperatura fermentacije (°C)',
    labelTargetRiseTime: 'Ciljno vrijeme dizanja (sati)',
    labelBulkFerment: 'Masovna fermentacija (sati)',
    labelAutolyse: 'Autoliza',
    labelAutolyseMinutes: 'Autoliza (minute)',
    labelUseAutolyse: 'Koristi autolizu',
    labelIncludeSugar: 'Uključi šećer',
    helpRiseTime: 'Predpostavke se razlikuju po stilu',
    helpAutolyse: 'Odmor brašna i vode prije dodavanja soli/kvasca za bolji razvoj glutena',
    helpSugar: 'Šećer pomaže u posmeđivanju i fermentaciji. Predpostavka: {percent}%',
    labelResults: 'Rezultati',
    labelIngredients: 'Sastojci',
    flour: 'Brašno',
    water: 'Voda',
    salt: 'Sol',
    oil: 'Ulje',
    sugar: 'Šećer',
    yeast: 'Kvasac',
    totalDough: 'Ukupno tijesto',
    perBall: 'Po kugli',
    bakeTime: 'Vrijeme pečenja',
    minutes: 'minuta',
    labelTimeline: 'Vremenski plan',
    timelineTitle: 'Raspored korak po korak',
    timelineStartNow: 'Počni sada',
    timelineStartIn: 'Počni za {hours}h',
    timelineToHaveReady: 'da bi pizza bila spremna u',
    timelineTotalTime: 'Ukupno vrijeme:',
    timelineModeTime: 'Vrijeme',
    timelineModeDuration: 'Trajanje',
    stepMix: 'Miješanje sastojaka',
    stepAutolyse: 'Odmor autolize',
    stepBulkFerment: 'Masovna fermentacija',
    stepDivide: 'Dijeljenje i oblikovanje',
    stepFinalProof: 'Završno dizanje',
    stepBake: 'Pečenje',
    stepMixDesc: 'Kombiniraj {flour}g brašna, {water}g vode, {salt}g soli, {yeast}g kvasca{additions}',
    stepAutolyseDesc: 'Odmor samo brašna i vode',
    stepBulkFermentDesc: 'Prvo dizanje na {temp}°C',
    stepDivideDesc: 'Podijeli na {count} kugl{plural}',
    stepFinalProofDesc: 'Drugo dizanje na {temp}°C',
    stepBakeDesc: 'Peci na {temp}°C {minutes} minuta',
    labelReference: 'Referenca',
    referenceTitle: 'Vodič za težinu kugle tijesta',
    referenceSubtitle: 'Preporučene težine po veličini/stilu pizze',
    appDescription: 'Počni od klasičnog stila, prilagodi hidraciju, odaberi kvasac i pećnicu, i veličinu po ukupnoj težini tijesta ili promjeru pizze.',
    labelYeastType: 'Vrsta kvasca',
    helpPresetDefault: 'Predpostavka zadano: {percent}%',
    helpBaseYeast: 'Osnovni kvasac: {percent}% brašna (prilagođeno po vrsti)',
    helpBulkFerment: 'Prvo dizanje nakon miješanja, prije dijeljenja u kugle',
    resultsDescription: 'Prilagodi hidraciju, vrstu kvasca i veličinu da vidiš ažurirane težine.',
    labelOvenTemp: 'Temperatura pećnice',
    labelCapped: '(ograničeno)',
    labelGrams: 'Grami',
    now: 'Sada',
  },
}

export function getTranslations(lang: Language): Translations {
  return translations[lang]
}

export function t(lang: Language, key: keyof Translations, params?: Record<string, string | number>): string {
  const translation = translations[lang][key]
  if (!translation) return key

  if (params) {
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match
    })
  }

  return translation
}

