// maybe as array when use multiple, maybe as store
export const allPrimer = [{
  notes: [
    { pitch: 60, quantizedStartStep: 0, quantizedEndStep: 4 },
    { pitch: 60, quantizedStartStep: 4, quantizedEndStep: 8 },
    { pitch: 67, quantizedStartStep: 8, quantizedEndStep: 12 },
    { pitch: 67, quantizedStartStep: 12, quantizedEndStep: 16 },
    { pitch: 69, quantizedStartStep: 16, quantizedEndStep: 20 },
    { pitch: 69, quantizedStartStep: 20, quantizedEndStep: 24 },
    { pitch: 67, quantizedStartStep: 24, quantizedEndStep: 32 },
    { pitch: 65, quantizedStartStep: 32, quantizedEndStep: 36 },
    { pitch: 65, quantizedStartStep: 36, quantizedEndStep: 40 },
    { pitch: 64, quantizedStartStep: 40, quantizedEndStep: 44 },
    { pitch: 64, quantizedStartStep: 44, quantizedEndStep: 48 },
    { pitch: 62, quantizedStartStep: 48, quantizedEndStep: 52 },
    { pitch: 62, quantizedStartStep: 52, quantizedEndStep: 56 },
    { pitch: 60, quantizedStartStep: 56, quantizedEndStep: 64 }
  ],
  totalTime: 8,
  totalQuantizedSteps: 64,
  index: 0,
  key: { tonic: "C", type: "major" },
  inScale: [0, 2, 4, 5, 7, 9, 11]
}, {
  notes: [
    { pitch: 60, quantizedStartStep: 0, quantizedEndStep: 4 },
    { pitch: 60, quantizedStartStep: 4, quantizedEndStep: 8 },
    { pitch: 65, quantizedStartStep: 8, quantizedEndStep: 12 },
    { pitch: 67, quantizedStartStep: 12, quantizedEndStep: 16 },
    { pitch: 71, quantizedStartStep: 16, quantizedEndStep: 20 },
    { pitch: 69, quantizedStartStep: 20, quantizedEndStep: 24 },
    { pitch: 67, quantizedStartStep: 24, quantizedEndStep: 32 },
    { pitch: 65, quantizedStartStep: 32, quantizedEndStep: 36 },
    { pitch: 65, quantizedStartStep: 36, quantizedEndStep: 40 },
    { pitch: 64, quantizedStartStep: 40, quantizedEndStep: 44 },
    { pitch: 62, quantizedStartStep: 44, quantizedEndStep: 48 },
    { pitch: 62, quantizedStartStep: 48, quantizedEndStep: 52 },
    { pitch: 64, quantizedStartStep: 52, quantizedEndStep: 56 },
    { pitch: 60, quantizedStartStep: 56, quantizedEndStep: 64 }
  ],
  totalTime: 8,
  totalQuantizedSteps: 64,
  index: 1,
  key: { tonic: "C", type: "major" },
  inScale: [0, 2, 4, 5, 7, 9, 11]
}, {
  notes: [
    { pitch: 60, quantizedStartStep: 0, quantizedEndStep: 4 },
    { pitch: 60, quantizedStartStep: 4, quantizedEndStep: 8 },
    { pitch: 67, quantizedStartStep: 8, quantizedEndStep: 12 },
    { pitch: 67, quantizedStartStep: 12, quantizedEndStep: 16 },
    { pitch: 69, quantizedStartStep: 16, quantizedEndStep: 20 },
    { pitch: 69, quantizedStartStep: 20, quantizedEndStep: 24 },
    { pitch: 67, quantizedStartStep: 24, quantizedEndStep: 32 },
    { pitch: 67, quantizedStartStep: 32, quantizedEndStep: 36 },
    { pitch: 65, quantizedStartStep: 36, quantizedEndStep: 40 },
    { pitch: 64, quantizedStartStep: 40, quantizedEndStep: 44 },
    { pitch: 62, quantizedStartStep: 44, quantizedEndStep: 48 },
    { pitch: 62, quantizedStartStep: 48, quantizedEndStep: 52 },
    { pitch: 62, quantizedStartStep: 52, quantizedEndStep: 56 },
    { pitch: 62, quantizedStartStep: 56, quantizedEndStep: 64 }
  ],
  totalTime: 8,
  totalQuantizedSteps: 64,
  index: 2,
  key: { tonic: "C", type: "major" },
  inScale: [0, 2, 4, 5, 7, 9, 11]
}]

export const axisoptions = [{ label: 'DR', value: 0, shortLabel: 'DR' },
{ label: 'Temperature', value: 4, shortLabel: 'Temp' },
{ label: 'SimilarityPrimer', value: 5, shortLabel: 'SimPrim' },
{ label: 'VarianceIntervals', value: 6, shortLabel: 'VarInt' },
{ label: 'NumberOfNotes', value: 7, shortLabel: 'NumNot' },
{ label: 'PercentinScale', value: 8, shortLabel: '%inScale' }]

export const axisoptionsCor = [
  { label: 'Temperature', value: 4, shortLabel: 'Temp' },
  { label: 'Similarity to Primer', value: 5, shortLabel: 'SimPrim' },
  { label: 'Variance of Intervals', value: 6, shortLabel: 'VarInt' },
  { label: 'Number of Notes', value: 7, shortLabel: 'NumNot' },
  { label: 'Percentage in Scale', value: 8, shortLabel: '%inScale' }]

export const keysLookup = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']